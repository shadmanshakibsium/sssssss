const apiKey = "80c2a42";

/**
 * API থেকে মুভি ডেটা ফেচ করা
 * @param {string} id - IMDB ID
 * @returns {object|null} - মুভি অবজেক্ট বা null
 */
async function fetchMovie(id) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
    const data = await res.json();
    return data.Response === "True" ? data : null;
  } catch (err) {
    console.error("Error fetching movie:", id, err);
    return null;
  }
}

/**
 * একটি ক্যাটাগরি লোড করা এবং কার্ড রেন্ডার করা
 * @param {string} jsonPath - JSON ফাইলের পাথ
 */
async function loadCategory(jsonPath) {
  try {
    const res = await fetch(jsonPath);
    const ids = await res.json();
    const container = document.getElementById("list");
    container.innerHTML = "";

    const movies = await Promise.all(ids.map(fetchMovie));
    movies.forEach(m => m && renderCard(m, container));
  } catch (err) {
    console.error("Error loading category:", jsonPath, err);
  }
}

/**
 * কার্ড রেন্ডার
 * @param {object} movie - মুভি ডেটা
 * @param {HTMLElement} container - কার্ড কন্টেইনার
 */
function renderCard(movie, container) {
  const div = document.createElement("div");
  div.classList.add("card");
  div.innerHTML = `
    <img src="${movie.Poster}" alt="${movie.Title}">
    <div class="overlay">
      <h2>${movie.Title} (${movie.Year})</h2>
      <p>${movie.Plot}</p>
      <div class="rating">⭐ ${movie.imdbRating || "N/A"}</div>
    </div>
  `;
  container.appendChild(div);
}

/**
 * সার্চ ফাংশন
 * @param {string} query - সার্চ কুয়েরি
 */
async function searchItems(query) {
  if (!query) return;

  const categories = [
    "data/movies.json",
    "data/series.json",
    "data/anime.json",
    "data/cartoons.json",
    "data/books.json"
  ];

  const container = document.getElementById("searchResults");
  container.innerHTML = "<p>Searching...</p>";
  let found = false;

  for (const cat of categories) {
    try {
      const res = await fetch(cat);
      const ids = await res.json();
      const movies = await Promise.all(ids.map(fetchMovie));

      movies.forEach(m => {
        if (m && m.Title.toLowerCase().includes(query.toLowerCase())) {
          if (!found) container.innerHTML = "";
          renderCard(m, container);
          found = true;
        }
      });
    } catch (err) {
      console.error("Error searching category:", cat, err);
    }
  }

  if (!found) container.innerHTML = "<p>No results found.</p>";
}

/**
 * DOM Loaded Listener - হোমপেজ সার্চ
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const query = document.getElementById("searchInput").value.trim();
      searchItems(query);
    });
  }
});
