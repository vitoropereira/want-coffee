import { FormFields } from "./Components/FormFields";
import { useCart } from "../../Context/CartContext";
import { CartItem } from "./Components/CartItem";
import { EmptyCart } from "./Components/EmptyCart";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useValidation } from "../../hooks/useValidation";
import { useFormatter } from "../../hooks/useFormatter";
import { Loading } from "../../Components/Loading";

import {
  CalcTotal,
  CalcTotalItens,
  CalcTotalSection,
  CalcTotalShipping,
  FinalizeOrderContainer,
  FinalizeOrderContent,
  Form,
  FinalizeOrderButton,
} from "./styles";

export type FinalizeOrderData = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
  payment: string;
};

export function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const { cartItems, paymentMethod, getFinalizedOrderData } = useCart();
  const { finalizeOrderSchemaValidation } = useValidation();

  const arrayTotalPriceOfItems = cartItems.map((item) => item.totalPrice);

  const totalPriceOfItems = arrayTotalPriceOfItems
    ? arrayTotalPriceOfItems.reduce((acc, item) => {
        return acc + item;
      }, 0)
    : 1;

  const shipping = 3.5;
  const total = totalPriceOfItems + shipping;

  const { currency: totalOfItems } = useFormatter(totalPriceOfItems);
  const { currency: shippingFormatted } = useFormatter(shipping);
  const { currency: totalFormatted } = useFormatter(total);

  const isCartItemEmpty = cartItems.length === 0;

  const finalizeOrderForm = useForm<FinalizeOrderData>({
    resolver: zodResolver(finalizeOrderSchemaValidation),
    defaultValues: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      uf: "",
      payment: "",
    },
  });

  const { handleSubmit } = finalizeOrderForm;

  function handleFinalizeOrder(data: FinalizeOrderData) {
    setIsLoading(true);

    const orderData = {
      ...data,
      uf: data.uf.toUpperCase(),
      payment: paymentMethod,
    };

    try {
      setTimeout(() => {
        getFinalizedOrderData(orderData);

        navigate("/success");
      }, 2000);
    } catch (error) {
      console.log(error);
      navigate("/");
    }
  }

  return (
    <>
      {isLoading && <Loading />}

      <Form onSubmit={handleSubmit(handleFinalizeOrder)}>
        <FormProvider {...finalizeOrderForm}>
          <FormFields />
        </FormProvider>

        <FinalizeOrderContainer>
          <span>Caf??s selecionados</span>

          <FinalizeOrderContent>
            {cartItems.length !== 0 ? (
              cartItems.map((cart) => <CartItem key={cart.id} cart={cart} />)
            ) : (
              <EmptyCart />
            )}

            <CalcTotalSection>
              <CalcTotalItens>
                <span>Total de itens</span>
                <span>{totalOfItems}</span>
              </CalcTotalItens>
              <CalcTotalShipping>
                <span>Entrega</span>
                <span>{!isCartItemEmpty ? shippingFormatted : "0"}</span>
              </CalcTotalShipping>
              <CalcTotal>
                <span>Total</span>
                <span>{!isCartItemEmpty ? totalFormatted : "0"}</span>
              </CalcTotal>
            </CalcTotalSection>

            <FinalizeOrderButton type="submit" disabled={isCartItemEmpty}>
              Confirmar Pedido
            </FinalizeOrderButton>
          </FinalizeOrderContent>
        </FinalizeOrderContainer>
      </Form>
    </>
  );
}
