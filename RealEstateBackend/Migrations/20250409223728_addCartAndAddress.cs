using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.Migrations
{
    /// <inheritdoc />
    public partial class addCartAndAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Address_Buyers_BuyerId",
                table: "Address");

            migrationBuilder.DropForeignKey(
                name: "FK_Cart_Address_SelectedAddressId",
                table: "Cart");

            migrationBuilder.DropForeignKey(
                name: "FK_Cart_Buyers_BuyerId",
                table: "Cart");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Cart_CartId",
                table: "OrderItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Cart",
                table: "Cart");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Address",
                table: "Address");

            migrationBuilder.RenameTable(
                name: "Cart",
                newName: "Carts");

            migrationBuilder.RenameTable(
                name: "Address",
                newName: "Addresses");

            migrationBuilder.RenameIndex(
                name: "IX_Cart_SelectedAddressId",
                table: "Carts",
                newName: "IX_Carts_SelectedAddressId");

            migrationBuilder.RenameIndex(
                name: "IX_Cart_BuyerId",
                table: "Carts",
                newName: "IX_Carts_BuyerId");

            migrationBuilder.RenameIndex(
                name: "IX_Address_BuyerId",
                table: "Addresses",
                newName: "IX_Addresses_BuyerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Carts",
                table: "Carts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Buyers_BuyerId",
                table: "Addresses",
                column: "BuyerId",
                principalTable: "Buyers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_Addresses_SelectedAddressId",
                table: "Carts",
                column: "SelectedAddressId",
                principalTable: "Addresses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_Buyers_BuyerId",
                table: "Carts",
                column: "BuyerId",
                principalTable: "Buyers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Carts_CartId",
                table: "OrderItems",
                column: "CartId",
                principalTable: "Carts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Buyers_BuyerId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Carts_Addresses_SelectedAddressId",
                table: "Carts");

            migrationBuilder.DropForeignKey(
                name: "FK_Carts_Buyers_BuyerId",
                table: "Carts");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Carts_CartId",
                table: "OrderItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Carts",
                table: "Carts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses");

            migrationBuilder.RenameTable(
                name: "Carts",
                newName: "Cart");

            migrationBuilder.RenameTable(
                name: "Addresses",
                newName: "Address");

            migrationBuilder.RenameIndex(
                name: "IX_Carts_SelectedAddressId",
                table: "Cart",
                newName: "IX_Cart_SelectedAddressId");

            migrationBuilder.RenameIndex(
                name: "IX_Carts_BuyerId",
                table: "Cart",
                newName: "IX_Cart_BuyerId");

            migrationBuilder.RenameIndex(
                name: "IX_Addresses_BuyerId",
                table: "Address",
                newName: "IX_Address_BuyerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Cart",
                table: "Cart",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Address",
                table: "Address",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Address_Buyers_BuyerId",
                table: "Address",
                column: "BuyerId",
                principalTable: "Buyers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Cart_Address_SelectedAddressId",
                table: "Cart",
                column: "SelectedAddressId",
                principalTable: "Address",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Cart_Buyers_BuyerId",
                table: "Cart",
                column: "BuyerId",
                principalTable: "Buyers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Cart_CartId",
                table: "OrderItems",
                column: "CartId",
                principalTable: "Cart",
                principalColumn: "Id");
        }
    }
}
