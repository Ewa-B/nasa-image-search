window.addEventListener("load", function () {
  // Select DOM elements
  const loading = document.querySelector(".loading"),
    error = document.querySelector(".error"),
    noInput = document.querySelector(".noInput"),
    target = document.querySelector(".target"),
    searchInput = document.querySelector("#searchInput"),
    submitInput = document.querySelector("#submitInput"),
    footer = document.querySelector(".footer"),
    searchLabel = document.querySelector("#searchLabel");
  searchLabel.style.display = "none";

  // Clear search results
  function clear() {
    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }
  }

  // Event listener for search button
  submitInput.addEventListener("click", function (e) {
    clear();
    e.preventDefault();

    const search = searchInput.value.trim();
    // Update URL with search query string and push to history
    history.pushState({ search: search }, "", "?search=" + search);
    searchImages(search);
  });

  // Search and disply images
  function searchImages(search) {
    loading.style.display = "block";
    if (search == "") {
      loading.style.display = "none";
      noInput.style.display = "block";
      error.style.display = "none";
      return;
    } else {
      noInput.style.display = "none";
      error.style.display = "none";
      clear();
    }
    // API call
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
      if (xhr.status == 200) {
        loading.style.display = "none";
        error.style.display = "none";
        const info = JSON.parse(xhr.responseText),
          items = info.collection.items;
        if (items.length == 0) {
          error.style.display = "block";
          noInput.style.display = "none";
        } else {
          // Create elements and append to DOM
          for (let i = 0; i < items.length; i++) {
            (figure = document.createElement("figure")),
              (figcaption = document.createElement("figcaption")),
              (title = document.createElement("h3")),
              (date = document.createElement("h4")),
              (img = document.createElement("img")),
              (descr = document.createElement("p"));
            title.textContent = items[i].data[0].title;
            descr.textContent = items[i].data[0].description;
            date.textContent =
              "Date: " + items[i].data[0].date_created.substring(0, 10);
            const links = items[i].links;
            // Check if image exists
            if (links !== undefined) {
              target.appendChild(figure);
              figure.appendChild(img);
              figure.appendChild(figcaption);
              img.addEventListener("error", function () {
                this.src = "images/no-image.png";
                this.alt = "Error loading image";
              });

              img.src = items[i].links[0].href;
              img.alt = items[i].data[0].title;
              figcaption.appendChild(title);
              figcaption.appendChild(date);
              figcaption.appendChild(descr);
              figcaption.style.display = "none";
              footer.style.display = "none";
            }
          }
        }
      }
      const images = document.querySelectorAll("figure img");

      // Event listener for image click
      images.forEach((image) => {
        image.addEventListener("click", function () {
          const enlargedImage = document.createElement("div");
          enlargedImage.classList.add("enlarged-image");

          const imageContainer = document.createElement("div");
          imageContainer.classList.add("image-container");

          const img = document.createElement("img");
          img.src = this.src;
          img.alt = this.alt;

          const caption = document.createElement("div");
          caption.classList.add("caption");

          const figcaption = this.parentElement.querySelector("figcaption");
          const title = figcaption.querySelector("h3").cloneNode(true);
          const date = figcaption.querySelector("h4").cloneNode(true);
          const description = figcaption.querySelector("p").cloneNode(true);
          caption.appendChild(title);
          caption.appendChild(date);
          caption.appendChild(description);

          imageContainer.appendChild(img);
          imageContainer.appendChild(caption);
          enlargedImage.appendChild(imageContainer);
          document.body.appendChild(enlargedImage);

          // Event listener for enlarged image click
          enlargedImage.addEventListener("click", function () {
            // Remove blur
            document.body.classList.remove("blur");
            this.remove();
          });
          // Blur background
          document.body.classList.add("blur");
        });
      });
    });

    xhr.open("GET", "https://images-api.nasa.gov/search?q=" + search, true);
    xhr.send();
  }

  // Event listener to the window object for popstate event
  window.addEventListener("popstate", function (e) {
    // Get search from state
    const search = e.state?.search;
    // If search exists, update search input and search images
    if (search) {
      searchInput.value = search;
      searchImages(search);
      // If search doesn't exist, reset search input and search results
    } else {
      searchInput.value = "";
      target.textContent = "";
      // Show footer and hide error and no input messages
      footer.style.display = "block";
      error.style.display = "none";
      noInput.style.display = "none";
    }
  });

  // Get initial search from query string
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search");
  // If initial search exists, update search input and images
  if (initialSearch) {
    searchInput.value = initialSearch;
    searchImages(initialSearch);
  }
});
