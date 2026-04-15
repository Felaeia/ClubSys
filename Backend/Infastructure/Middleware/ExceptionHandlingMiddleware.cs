using FluentValidation;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace ClubSys.Infastructure.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (DbUpdateException ex)
            {
                // 1. Unwrap the Inner Exception to find the Database specific error
                if (ex.InnerException is SqliteException sqliteEx && sqliteEx.SqliteExtendedErrorCode == 2067)
                {
                    // Error Code 2067 = SQLITE_CONSTRAINT_UNIQUE
                    await HandleUniqueConstraintError(context, sqliteEx);
                }
                else
                {
                    // 2. CRITICAL FIX: If it's any other DB error, treat it as a crash
                    await HandleGenericError(context, ex);
                }
            }
            catch (ValidationException ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                var response = new
                {
                    Errors = ex.Errors.Select(ex => new
                    {
                        ex.PropertyName,
                        ex.ErrorMessage
                    })
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                var response = new { ex.Message };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        }

        // Helper method to parse the SQLite message
        private async Task HandleUniqueConstraintError(HttpContext context, SqliteException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.Conflict;

            string message = "This record already exists.";

            // DEBUG: Print the RAW message to your console so you can see exactly what SQLite sent
            Console.WriteLine($"[SQLite Error] {ex.Message}");

            // Regex Explanation:
            // 1. Look for "UNIQUE constraint failed:"
            // 2. \s* matches any whitespace
            // 3. (?:.*\.)? matches the table name (e.g. "Users.") but ignores it
            // 4. (\w+) CAPTURES the actual column name (e.g. "Email")
            var match = Regex.Match(ex.Message, @"UNIQUE constraint failed:\s*(?:.*\.)?(\w+)");

            if (match.Success)
            {
                // match.Groups[1] is the part inside the parentheses (\w+)
                var columnName = match.Groups[1].Value;
                message = $"An error occurred: {columnName} already exists in the database.";
            }

            var response = new { Error = message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }

        private async Task HandleGenericError(HttpContext context, Exception ex)
        {
            // ALWAYS Log the real error internally so YOU can see it.
            _logger.LogError(ex, "An unhandled exception occurred.");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            object response;

            // 4. THE CHECK
            if (_env.IsDevelopment())
            {
                // In Development: Show me everything (Message + StackTrace)
                response = new
                {
                    Error = ex.Message,
                    StackTrace = ex.StackTrace // Helpful for debugging!
                };
            }
            else
            {
                // In Production: Show a polite, vague message.
                response = new
                {
                    Error = "An internal server error occurred. Please contact support."
                };
            }

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
