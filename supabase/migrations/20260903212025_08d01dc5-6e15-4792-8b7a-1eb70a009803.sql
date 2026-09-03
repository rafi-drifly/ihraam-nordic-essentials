drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can update all orders"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments"
  on public.payments for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
