import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (cartProducts) setProducts(JSON.parse(cartProducts));
    }

    loadProducts();
  }, []);

  // useEffect(() => console.log(products), [products]);

  const addToCart = useCallback(
    async (product) => {
      const productFound = products.find(
        (cartProduct) => cartProduct.id === product.id,
      );

      if (!productFound) {
        products.push({ ...product, quantity: 1 });

        setProducts([...products]);
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );
      } else {
        const newProducts = products.map((cartProduct) =>
          cartProduct.id === product.id
            ? { ...cartProduct, quantity: cartProduct.quantity + 1 }
            : cartProduct,
        );
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async (id) => {
      const newProducts = products.map((cartProduct) =>
        cartProduct.id === id
          ? { ...cartProduct, quantity: cartProduct.quantity + 1 }
          : cartProduct,
      );

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async (id) => {
      const productFound = products.find(
        (cartProduct) => cartProduct.id === id,
      );

      if (productFound?.quantity === 1) {
        const newProducts = products.slice();
        const decrementedIndex = newProducts.findIndex(
          (cartProduct) => cartProduct.id === id,
        );
        newProducts.splice(decrementedIndex, 1);

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(newProducts),
        );
      } else {
        const newProducts = products.map((cartProduct) =>
          cartProduct.id === id
            ? { ...cartProduct, quantity: cartProduct.quantity - 1 }
            : cartProduct,
        );

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}

export { CartProvider, useCart };
