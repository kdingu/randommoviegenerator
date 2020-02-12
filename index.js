const url = "http://randommovie.atwebpages.com/";

const cache = {
  images: {
    base_url: "http://image.tmdb.org/t/p/",
    secure_url: "https://image.tmdb.org/t/p/",
    backdrop_sizes: ["w300", "w780", "w1280", "original"],
    logo_sizes: ["w45", "w92", "w154", "w185", "w300", "w500", "original"],
    poster_sizes: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
    profile_sizes: ["w45", "w185", "h632", "original"],
    still_sizes: ["w92", "w185", "w300", "original"]
  }
};

const youtubeApiKey = "AIzaSyD0Ayokq6KvYv9ySdQpvjiw-u86_xvOFS0";
const tmdbApiKey = "0294709b1b63f18bf3d9c18b3875239a";

const modalBg = document.querySelector(".modal-background");
const modalBtn = document.querySelector(".modal-close");
const modal = document.querySelector("#modal-player");
const modalPoster = document.querySelector("#modal-poster");
const randomBtn = document.querySelector("#random-movie-btn");

const titleElement = document.querySelector("#title");
const genreElement = document.querySelector("#genre");
const overviewElement = document.querySelector("#overview");

const loader = document.querySelector(".loader-wrapper");
const tutorialContent = document.querySelector(".tutorial-content");

// let genreFilter;
randomBtn.addEventListener("click", () => {
  tutorialContent.classList.add("hide");
  loader.classList.add("is-active");
  randomMovieTrailer();
});

// to reduce calls to api made id static, needs update
let latestId = 671895;
const randomMovieTrailer = async () => {
  // get lates id from api
  getLatest();

  // generate random id from 0 to latestId
  const randomId = setRandomId(latestId);

  // get movie of TMDB randomId from api
  const movieDetails = await getDetails(randomId);
  const {
    adult,
    original_title,
    genres,
    videos,
    images,
    overview,
    release_date
  } = movieDetails.data;

  // do not allow adult movies
  if (!adult) {
    if (videos.results.length > 0) {
      let youtubeKey;
      let trailerFound = false;
      for (const video of videos.results) {
        if (video.type == "Trailer") {
          youtubeKey = video.key;
          trailerFound = true;
          continue;
        }
      }

      if (trailerFound) {
        // console.log(movieDetails.data);
        player.loadVideoById(youtubeKey);

        titleElement.innerText = `${original_title} ${release_date.slice(
          0,
          4
        )}`;
        overviewElement.innerText = `${overview}`;
        genreElement.innerText = "";
        if (genres.length > 0) {
          for (const genre of genres) {
            genreElement.innerText += `${genre.name}  `;
          }
        } else {
          genreElement.innerText = "No Genre Provided";
        }
        tutorialContent.classList.remove("hide");
        loader.classList.remove("is-active");
        modal.classList.toggle("is-active");
      } else {
        // console.log("Videos contained no trailer.. Rerun");
        randomMovieTrailer();
      }
    } else {
      // console.log("Got movie with no trailer... Rerun");
      randomMovieTrailer();
    }
  } else {
    // console.log("Got adult movie... Rerun");
    randomMovieTrailer();
  }
};

const setRandomId = multiplier => {
  return Math.floor(Math.random() * multiplier);
};

const getLatest = async () => {
  if (!latestId) {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/latest",
      {
        params: {
          api_key: tmdbApiKey
        }
      }
    );
    latestId = response.data.id;
  }
};

const getDetails = async id => {
  const response = await axios
    .get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: {
        api_key: tmdbApiKey,
        append_to_response: "videos,images"
      }
    })
    .catch(err => false);

  if (response) {
    return response;
  }

  const randomId = setRandomId(latestId);
  return getDetails(randomId);
};

// Autocomplete cofiguration helper
const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
              <img src="${imgSrc}" /> 
              ${movie.Title} 
              (${movie.Year})
          `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "30d8b8d5",
        s: `${searchTerm}`
      }
    });

    if (response.data.Error) {
      return [];
    }

    return response.data.Search;
  }
};

// Show search box with autocomplete functionality to search movies
createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#autocomplete"),
  async onOptionSelect(movie) {
    const searchTerm = movie.Title + " trailer";
    const videoId = await getVideos(searchTerm);
    player.loadVideoById(videoId);
    modal.classList.toggle("is-active");
  }
});

// Get id of trailer video from youtube api
const getVideos = async searchTerm => {
  const result = await axios.get(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        part: "snippet",
        maxResults: 1,
        q: searchTerm,
        videoEmbeddable: true,
        type: "video",
        videoDuration: "short",
        key: youtubeApiKey
      }
    }
  );
  for (const item of result.data.items) {
    return item.id.videoId;
  }
};

// 1. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.body.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
let player;
async function onYouTubeIframeAPIReady() {
  player = new YT.Player("player");
}

// Add click listeners to close modal and stop video
modalBg.addEventListener("click", () => {
  modal.classList.toggle("is-active");
  player.stopVideo();
});

modalBtn.addEventListener("click", () => {
  modal.classList.toggle("is-active");
  player.stopVideo();
});
