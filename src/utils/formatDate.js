export const getYearFromString = (dateString) => {
  // Creating a Date object from the date string
  const dateObject = new Date(dateString);
  // Getting the year from the Date object
  return dateObject.getFullYear();
};
