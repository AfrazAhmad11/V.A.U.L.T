using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VaultBackend.Migrations
{
    /// <inheritdoc />
    public partial class CampusWars : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CampusChampionCount",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsInstitutionVerified",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TargetInstitution",
                table: "Tournaments",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CampusChampionCount",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsInstitutionVerified",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TargetInstitution",
                table: "Tournaments");
        }
    }
}
