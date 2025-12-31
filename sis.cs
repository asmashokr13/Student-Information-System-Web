using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();

var app = builder.Build();

app.UseCors(x =>
    x.AllowAnyOrigin()
     .AllowAnyHeader()
     .AllowAnyMethod()
);

string connStr = builder.Configuration.GetConnectionString("DefaultConnection");

app.MapPost("/api/login", async (LoginRequest req) =>
{
    using SqlConnection con = new SqlConnection(connStr);
    await con.OpenAsync();

    string sql = @"
        SELECT Name, Email, Role
        FROM Users
        WHERE Email = @Email AND Password = @Password
    ";

    using SqlCommand cmd = new SqlCommand(sql, con);
    cmd.Parameters.AddWithValue("@Email", req.Email);
    cmd.Parameters.AddWithValue("@Password", req.Password);

    using SqlDataReader reader = await cmd.ExecuteReaderAsync();

    if (!reader.Read())
        return Results.Unauthorized();

    var user = new
    {
        name = reader["Name"].ToString(),
        email = reader["Email"].ToString(),
        role = reader["Role"].ToString()
    };

    return Results.Ok(user);
});

app.Run();

record LoginRequest(string Email, string Password);
builder.Services.AddCors();

app.UseCors(x =>
    x.AllowAnyOrigin()
     .AllowAnyHeader()
     .AllowAnyMethod()
);
