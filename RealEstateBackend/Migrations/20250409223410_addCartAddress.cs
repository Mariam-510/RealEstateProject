using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.Migrations
{
    /// <inheritdoc />
    public partial class addCartAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CartId",
                table: "OrderItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Address",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Street = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BuildingNum = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Apartment = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Floor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PhoneNum = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    BuyerId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Address_Buyers_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Buyers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Cart",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    BuyerId = table.Column<int>(type: "int", nullable: true),
                    SelectedAddressId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cart_Address_SelectedAddressId",
                        column: x => x.SelectedAddressId,
                        principalTable: "Address",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Cart_Buyers_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Buyers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_CartId",
                table: "OrderItems",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_Address_BuyerId",
                table: "Address",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_BuyerId",
                table: "Cart",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_SelectedAddressId",
                table: "Cart",
                column: "SelectedAddressId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Cart_CartId",
                table: "OrderItems",
                column: "CartId",
                principalTable: "Cart",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Cart_CartId",
                table: "OrderItems");

            migrationBuilder.DropTable(
                name: "Cart");

            migrationBuilder.DropTable(
                name: "Address");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_CartId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "CartId",
                table: "OrderItems");
        }
    }
}
