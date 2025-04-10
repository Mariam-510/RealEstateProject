using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.Migrations
{
    /// <inheritdoc />
    public partial class fiveMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AgentId",
                table: "Auctions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SellerId",
                table: "Auctions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_AgentId",
                table: "Auctions",
                column: "AgentId");

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_SellerId",
                table: "Auctions",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Auctions_Agents_AgentId",
                table: "Auctions",
                column: "AgentId",
                principalTable: "Agents",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Auctions_Sellers_SellerId",
                table: "Auctions",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Auctions_Agents_AgentId",
                table: "Auctions");

            migrationBuilder.DropForeignKey(
                name: "FK_Auctions_Sellers_SellerId",
                table: "Auctions");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_AgentId",
                table: "Auctions");

            migrationBuilder.DropIndex(
                name: "IX_Auctions_SellerId",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "AgentId",
                table: "Auctions");

            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "Auctions");
        }
    }
}
