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

    localStorage.setItem("@RocketShoes:cart", JSON.stringify([]));
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

          localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
          setCart(newCart);
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      } else {
        if (productAmountInStock > 0) {
          const responseOfProductInProductsRoute = await api.get(
            `products/${productId}`
          );

          const newProduct = {
            ...responseOfProductInProductsRoute.data,
            amount: 1,
          };

          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify([...cart, newProduct])
          );

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
      const existingProduct = cart.find((product) => product.id === productId);

      if (existingProduct) {
        const newCart = cart.filter((product) => {
          return product.id !== productId;
        });
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        setCart(newCart);
      } else {
        toast.error("Erro na remoção do produto");
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        return;
      }

      const responseOfproductInStock = await api.get(`stock/${productId}`);
      const productAmountInStock = responseOfproductInStock.data.amount;
      const newAmount = amount;

      if (productAmountInStock - newAmount >= 0) {
        const newCart = cart.map((product) => {
          if (productId === product.id) {
            return {
              ...product,
              amount: newAmount,
            };
          }
          return product;
        });

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        setCart(newCart);
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
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
