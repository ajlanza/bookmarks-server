function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: "Youtube",
      url: "https://www.youtube.com",
      description: "Tons and tons of videos",
      rating: 4
    },
    {
      id: 2,
      title: "Codewars",
      url:"https:www.codewars.com",
      description: "Practice what you've been forgetting.",
      rating: 5
    },
  ];
}

module.exports = {
  makeBookmarksArray,
}