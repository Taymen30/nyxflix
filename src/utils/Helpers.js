export function getTitle() {
  const today = new Date();
  const currentDate =
    ("0" + today.getDate()).slice(-2) +
    "-" +
    ("0" + (today.getMonth() + 1)).slice(-2);

  if (currentDate === "27-10") {
    return "HBD Brooke!";
  } else if (currentDate === "18-09") {
    return "HBD Carter!";
  } else if (currentDate === "29-09") {
    return "HBD Lily!";
  } else if (currentDate === "28-03") {
    return "HBD Mattijs!";
  } else if (currentDate === "23-01") {
    return "HBD Rick!";
  } else if (currentDate === "30-06") {
    return "HBD Ariane!";
  } else if (currentDate === "11-09") {
    return "HBD Carola!";
  } else {
    return "MovieMaster";
  }
}
