const generateIdentifier = (name) => {
  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters long.");
  }
  const namePart = name.slice(0, 2).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000); // This ensures a 4-digit number
  const identifier = `${namePart}${randomPart}`;
  return identifier;
};

const generateMonthList = (startDate) => {
  const result = [];
  const now = new Date();
  const start = new Date(startDate);
  let year = start.getFullYear();
  let month = start.getMonth();
  while (
    year < now.getFullYear() ||
    (year === now.getFullYear() && month <= now.getMonth())
  ) {
    result.push(
      new Date(year, month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    );
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return result;
};

const getMonthStartAndEnd = (input) => {
  const [monthName, year] = input.split(" ");
  const month = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

module.exports = {
  generateIdentifier,
  generateMonthList,
  getMonthStartAndEnd,
};
