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

function makeMaliciousBookmark() {
  const maliciousBookmark = { 
    id: 450,
    title:'No Good <script>alert("xss");</script>',
    url:'url',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    rating: 4,
  } 
  const expectedBookmark = {
    ...maliciousBookmark,
    title: 'No Good &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description:`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousBookmark,
    expectedBookmark
  }
}

module.exports = {
  makeBookmarksArray,
  makeMaliciousBookmark,
}