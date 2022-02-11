import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productInCart = cart.find((product) => product.id === productId);

      const responseOfProductInStock = await api.get(`stock/${productId}`);
      const productAmountInStock = responseOfProductInStock.data.amount;

      if (productInCart) {
        const productAmountInCart = productInCart.amount;

        if (productAmountInStock - productAmountInCart > 0) {
          productInCart.amount += 1;

          const newCart = cart.map((product) => {
            if (product.id === productId) {
              return productInCart;
            }
            return product;
          });

          setCart(newCart);
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      } else {
        if (productAmountInStock >= 0) {
          const responseOfProductInProductsRoute = await api.get(
            `products/${productId}`
          );

          const newProduct = {
            ...responseOfProductInProductsRoute.data,
            amount: 1,
          };

          setCart([...cart, newProduct]);
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      }

    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
