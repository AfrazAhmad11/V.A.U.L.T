using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VaultBackend.Migrations
{
    /// <inheritdoc />
    public partial class Iteration3LiteFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VaultPoints",
                table: "Wallets",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Institution",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVerifiedCafe",
                table: "Tournaments",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VaultPoints",
                table: "Wallets");

            migrationBuilder.DropColumn(
                name: "Institution",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsVerifiedCafe",
                table: "Tournaments");
        }
    }
}
