export const numberToDate = (fechaNumber: number) => {
  const dateString = fechaNumber + '';
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const date = new Date(+year, +month - 1, +day);

  const offset = date.getTimezoneOffset();
  const fecha = new Date(date.getTime() - offset * 60 * 1000);
  return fecha;
};
