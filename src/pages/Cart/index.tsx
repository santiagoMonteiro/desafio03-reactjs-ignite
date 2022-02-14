import React from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product) => {
    return {
      ...product,
      priceFormatted: formatPrice(product.price),
      subTotal: formatPrice(product.price * product.amount),
    };
  });

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      return sumTotal + product.price * product.amount;
    }, 0)
  );

  function handleProductIncrement(product: Product) {
    const productId = product.id;
    const amount = product.amount + 1;

    updateProductAmount({
      productId,
      amount,
    });
  }

  function handleProductDecrement(product: Product) {
    const productId = product.id;
    const amount = product.amount - 1;

    updateProductAmount({
      productId,
      amount,
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      {cartFormatted.map((formattedProduct) => {
        return (
          <ProductTable key={formattedProduct.id}>
            <thead>
              <tr>
                <th aria-label="product image" />
                <th>PRODUTO</th>
                <th>QTD</th>
                <th>SUBTOTAL</th>
                <th aria-label="delete icon" />
              </tr>
            </thead>

            <tbody>
              <tr data-testid="product">
                <td>
                  <img
                    src={formattedProduct.image}
                    alt={formattedProduct.title}
                  />
                </td>
                <td>
                  <strong>{formattedProduct.title}</strong>
                  <span>{formattedProduct.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={formattedProduct.amount <= 1}
                      onClick={() => handleProductDecrement(formattedProduct)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={formattedProduct.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(formattedProduct)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{formattedProduct.subTotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(formattedProduct.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            </tbody>
          </ProductTable>
        );
      })}

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
