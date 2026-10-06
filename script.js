/* =========================================================
   T-FACES GITHUB PROJECT EXPLORER
   SCRIPT.JS
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const GITHUB_USERNAME = "T-faces";

const API_BASE = "https://api.github.com";

const PER_PAGE_API = 100;

const PROJECTS_PER_PAGE = 9;


/* =========================================================
   STATE
========================================================= */

let allRepositories = [];

let filteredRepositories = [];

let currentPage = 1;

let currentSearch = "";

let currentLanguage = "all";

let currentSort = "updated";


/* =========================================================
   DOM
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileBio =
    document.getElementById("profileBio");

const heroRepos =
    document.getElementById("heroRepos");

const heroStars =
    document.getElementById("heroStars");

const heroFollowers =
    document.getElementById("heroFollowers");

const heroFollowing =
    document.getElementById("heroFollowing");

const projectGrid =
    document.getElementById("projectGrid");

const repositoryCount =
    document.getElementById("repositoryCount");

const resultInfo =
    document.getElementById("resultInfo");

const pagination =
    document.getElementById("pagination");

const noResults =
    document.getElementById("noResults");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const languageFilter =
    document.getElementById("languageFilter");

const sortSelect =
    document.getElementById("sortSelect");

const resetFilters =
    document.getElementById("resetFilters");

const statRepos =
    document.getElementById("statRepos");

const statStars =
    document.getElementById("statStars");

const statForks =
    document.getElementById("statForks");

const statLanguages =
    document.getElementById("statLanguages");

const languageChart =
    document.getElementById("languageChart");

const themeToggle =
    document.getElementById("themeToggle");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileMenu =
    document.getElementById("mobileMenu");

const backToTop =
    document.getElementById("backToTop");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    currentYear.textContent =
        new Date().getFullYear();

    loadSavedTheme();

    setupEvents();

    await loadGitHubData();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    searchInput.addEventListener(
        "input",
        handleSearch
    );


    clearSearch.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            currentSearch = "";

            clearSearch.classList.remove("show");

            currentPage = 1;

            applyFilters();

        }
    );


    languageFilter.addEventListener(
        "change",
        () => {

            currentLanguage =
                languageFilter.value;

            currentPage = 1;

            applyFilters();

        }
    );


    sortSelect.addEventListener(
        "change",
        () => {

            currentSort =
                sortSelect.value;

            currentPage = 1;

            applyFilters();

        }
    );


    resetFilters.addEventListener(
        "click",
        resetAllFilters
    );


    themeToggle.addEventListener(
        "click",
        toggleTheme
    );


    mobileMenuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "open"
            );

        }
    );


    mobileMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "open"
                    );

                }
            );

        });


    window.addEventListener(
        "scroll",
        handleScroll
    );

}


/* =========================================================
   GITHUB API
========================================================= */

async function loadGitHubData() {

    try {

        showLoading();

        const [
            profile,
            repositories
        ] = await Promise.all([

            fetchGitHubProfile(),

            fetchAllRepositories()

        ]);


        renderProfile(profile);

        allRepositories =
            repositories.filter(
                repo =>
                    !repo.private
            );


        repositoryCount.textContent =
            allRepositories.length;


        calculateStatistics(
            allRepositories
        );


        populateLanguageFilter(
            allRepositories
        );


        applyFilters();


        hideLoading();


    } catch (error) {

        console.error(
            "GitHub API Error:",
            error
        );


        showError(error);

    }

}


/* =========================================================
   PROFILE
========================================================= */

async function fetchGitHubProfile() {

    const response =
        await fetch(
            `${API_BASE}/users/${GITHUB_USERNAME}`,
            {
                headers: {
                    Accept:
                        "application/vnd.github+json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            `Gagal mengambil profil GitHub (${response.status})`
        );

    }


    return response.json();

}


/* =========================================================
   HANYA REPOSITORY YANG MEMILIKI DEMO / GITHUB PAGES
========================================================= */

function hasDemo(repo) {

    // 1. Homepage dari repository
    if (
        repo.homepage &&
        repo.homepage.trim() !== ""
    ) {
        return true;
    }


    // 2. Repository GitHub Pages khusus user
    if (
        repo.name.toLowerCase() ===
        `${GITHUB_USERNAME.toLowerCase()}.github.io`
    ) {
        return true;
    }


    // 3. Repository dengan nama .github.io
    if (
        repo.name
            .toLowerCase()
            .endsWith(".github.io")
    ) {
        return true;
    }


    return false;

}


/* =========================================================
   AMBIL REPOSITORY
========================================================= */

async function fetchAllRepositories() {

    const url =
        `${API_BASE}/users/${GITHUB_USERNAME}/repos` +
        `?per_page=${PER_PAGE_API}` +
        `&page=1` +
        `&type=owner` +
        `&sort=updated`;


    const response =
        await fetch(
            url,
            {
                headers: {
                    Accept:
                        "application/vnd.github+json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            `Gagal mengambil repository (${response.status})`
        );

    }


    const repositories =
        await response.json();


    /*
       HANYA AMBIL REPOSITORY
       YANG MEMILIKI DEMO / HOMEPAGE
    */

    return repositories.filter(
        repo => hasDemo(repo)
    );

}



/* =========================================================
   RENDER PROFILE
========================================================= */

function renderProfile(profile) {

    profileAvatar.src =
        profile.avatar_url;

    profileAvatar.alt =
        profile.login;


    profileName.textContent =
        profile.name ||
        profile.login;


    profileBio.textContent =
        profile.bio ||
        "Developer & Technology Explorer";


    heroRepos.textContent =
        formatNumber(
            profile.public_repos
        );


    heroFollowers.textContent =
        formatNumber(
            profile.followers
        );


    heroFollowing.textContent =
        formatNumber(
            profile.following
        );

}


/* =========================================================
   STATISTICS
========================================================= */

function calculateStatistics(repositories) {

    const totalStars =
        repositories.reduce(
            (sum, repo) =>
                sum + repo.stargazers_count,
            0
        );


    const totalForks =
        repositories.reduce(
            (sum, repo) =>
                sum + repo.forks_count,
            0
        );


    const languages =
        repositories
            .map(repo => repo.language)
            .filter(Boolean);


    const uniqueLanguages =
        new Set(languages);


    heroStars.textContent =
        formatNumber(totalStars);


    statRepos.textContent =
        formatNumber(
            repositories.length
        );


    statStars.textContent =
        formatNumber(totalStars);


    statForks.textContent =
        formatNumber(totalForks);


    statLanguages.textContent =
        uniqueLanguages.size;


    renderLanguageChart(
        repositories
    );

}


/* =========================================================
   LANGUAGE FILTER
========================================================= */

function populateLanguageFilter(
    repositories
) {

    const languages =
        [
            ...new Set(
                repositories
                    .map(repo => repo.language)
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );


    languageFilter.innerHTML = `

        <option value="all">
            Semua Bahasa
        </option>

    `;


    languages.forEach(
        language => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                language;

            option.textContent =
                language;

            languageFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   FILTER
========================================================= */

function handleSearch(event) {

    currentSearch =
        event.target.value
            .trim()
            .toLowerCase();


    currentPage = 1;


    if (currentSearch) {

        clearSearch.classList.add(
            "show"
        );

    } else {

        clearSearch.classList.remove(
            "show"
        );

    }


    applyFilters();

}


function applyFilters() {

    filteredRepositories =
        allRepositories.filter(
            repo => {

                /*
                   Pastikan repository
                   memang memiliki demo
                */

                if (
                    !hasDemo(repo)
                ) {

                    return false;

                }


                const searchableText =
                    [

                        repo.name,

                        repo.full_name,

                        repo.description,

                        repo.language,

                        ...(repo.topics || [])

                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !currentSearch ||
                    searchableText.includes(
                        currentSearch
                    );


                const matchesLanguage =
                    currentLanguage === "all" ||
                    repo.language ===
                        currentLanguage;


                return (
                    matchesSearch &&
                    matchesLanguage
                );

            }
        );


    sortRepositories(
        filteredRepositories
    );


    renderProjects();

}


/* =========================================================
   SORT
========================================================= */

function sortRepositories(
    repositories
) {

    repositories.sort(
        (a, b) => {

            switch (
                currentSort
            ) {

                case "created":

                    return (
                        new Date(b.created_at) -
                        new Date(a.created_at)
                    );


                case "stars":

                    return (
                        b.stargazers_count -
                        a.stargazers_count
                    );


                case "forks":

                    return (
                        b.forks_count -
                        a.forks_count
                    );


                case "name":

                    return a.name
                        .localeCompare(
                            b.name
                        );


                case "name-desc":

                    return b.name
                        .localeCompare(
                            a.name
                        );


                case "updated":

                default:

                    return (
                        new Date(b.updated_at) -
                        new Date(a.updated_at)
                    );

            }

        }
    );

}


/* =========================================================
   RENDER PROJECTS
========================================================= */

function renderProjects() {

    const total =
        filteredRepositories.length;


    const totalPages =
        Math.ceil(
            total /
            PROJECTS_PER_PAGE
        );


    if (
        total === 0
    ) {

        projectGrid.innerHTML = "";

        pagination.innerHTML = "";

        noResults.classList.remove(
            "hidden"
        );

        resultInfo.textContent =
            "Tidak ada repository yang cocok.";

        return;

    }


    noResults.classList.add(
        "hidden"
    );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (
            currentPage - 1
        ) *
        PROJECTS_PER_PAGE;


    const end =
        start +
        PROJECTS_PER_PAGE;


    const pageRepositories =
        filteredRepositories.slice(
            start,
            end
        );


    projectGrid.innerHTML =
        pageRepositories
            .map(
                (
                    repo,
                    index
                ) =>
                    createRepositoryCard(
                        repo,
                        index
                    )
            )
            .join("");


    const from =
        start + 1;


    const to =
        Math.min(
            end,
            total
        );


    resultInfo.textContent =
        `Menampilkan ${from}–${to} dari ${total} repository`;


    renderPagination(
        totalPages
    );


    window.requestAnimationFrame(
        () => {

            document
                .querySelector(
                    "#projects"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );

}


/* =========================================================
   REPOSITORY CARD
========================================================= */

function createRepositoryCard(
    repo,
    index
) {

    const description =
        repo.description ||
        "Tidak ada deskripsi untuk repository ini.";


    const language =
        repo.language ||
        "Other";


    const topics =
        repo.topics || [];


    const topicHTML =
        topics
            .slice(0, 4)
            .map(
                topic =>
                    `
                    <span class="topic">
                        #${escapeHTML(topic)}
                    </span>
                    `
            )
            .join("");


   const demoURL =
    getDemoURL(repo);


const homepageButton =
    demoURL
        ? `
            <a
                class="project-link"
                href="${escapeAttribute(demoURL)}"
                target="_blank"
                rel="noopener"
            >
                <i class="fa-solid fa-globe"></i>
                Live Demo
            </a>
        `
        : "";


    return `

        <article
            class="project-card"
            style="animation-delay:${index * 0.04}s"
        >

            <div class="project-top">

                <div class="project-icon">

                    <i class="fa-solid fa-folder-open"></i>

                </div>


                <span class="project-visibility">

                    ${repo.fork ? "Fork" : "Public"}

                </span>

            </div>


            <h3>
                ${escapeHTML(repo.name)}
            </h3>


            <p class="project-description">

                ${escapeHTML(description)}

            </p>


            ${
                topicHTML
                    ? `
                        <div class="project-topics">
                            ${topicHTML}
                        </div>
                    `
                    : ""
            }


            <div class="project-footer">

                <div class="project-meta">

                    <span>

                        <span
                            class="language-dot"
                        ></span>

                        ${escapeHTML(language)}

                    </span>


                    <span>

                        <i class="fa-solid fa-star"></i>

                        ${formatNumber(
                            repo.stargazers_count
                        )}

                    </span>


                    <span>

                        <i class="fa-solid fa-code-fork"></i>

                        ${formatNumber(
                            repo.forks_count
                        )}

                    </span>

                </div>


                <div class="project-links">

                    <a
                        class="project-link"
                        href="${escapeAttribute(repo.html_url)}"
                        target="_blank"
                        rel="noopener"
                    >

                        <i class="fa-brands fa-github"></i>

                        Repository

                    </a>


                    ${homepageButton}

                </div>

            </div>

        </article>

    `;

}

/* =========================================================
   DETEKSI URL DEMO
========================================================= */

function getDemoURL(repo) {

    // Homepage yang diberikan GitHub
    if (
        repo.homepage &&
        repo.homepage.trim() !== ""
    ) {

        return repo.homepage.trim();

    }


    // GitHub Pages utama
    if (
        repo.name.toLowerCase() ===
        `${GITHUB_USERNAME.toLowerCase()}.github.io`
    ) {

        return `
            https://${GITHUB_USERNAME}.github.io/
        `;

    }


    // Repository *.github.io
    if (
        repo.name
            .toLowerCase()
            .endsWith(".github.io")
    ) {

        return `
            https://${repo.name}/
        `;

    }


    return null;

}


/* =========================================================
   PAGINATION
========================================================= */

function renderPagination(
    totalPages
) {

    pagination.innerHTML = "";


    if (
        totalPages <= 1
    ) {

        return;

    }


    const fragment =
        document.createDocumentFragment();


    const previous =
        createPageButton(
            "‹",
            currentPage - 1,
            currentPage === 1
        );


    fragment.appendChild(
        previous
    );


    const pages =
        generatePageNumbers(
            currentPage,
            totalPages
        );


    pages.forEach(
        page => {

            if (
                page === "..."
            ) {

                const dots =
                    document.createElement(
                        "span"
                    );

                dots.textContent =
                    "...";

                dots.style.padding =
                    "0 5px";

                dots.style.color =
                    "var(--text-secondary)";

                fragment.appendChild(
                    dots
                );

            } else {

                fragment.appendChild(
                    createPageButton(
                        page,
                        page,
                        false,
                        page === currentPage
                    )
                );

            }

        }
    );


    const next =
        createPageButton(
            "›",
            currentPage + 1,
            currentPage === totalPages
        );


    fragment.appendChild(
        next
    );


    pagination.appendChild(
        fragment
    );

}


function createPageButton(
    text,
    page,
    disabled = false,
    active = false
) {

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "page-button";


    button.textContent =
        text;


    if (active) {

        button.classList.add(
            "active"
        );

    }


    if (disabled) {

        button.classList.add(
            "disabled"
        );

    }


    button.addEventListener(
        "click",
        () => {

            if (
                disabled
            ) {

                return;

            }


            currentPage =
                page;


            renderProjects();

            window.scrollTo({
                top:
                    document.querySelector(
                        "#projects"
                    ).offsetTop - 90,
                behavior:
                    "smooth"
            });

        }
    );


    return button;

}


function generatePageNumbers(
    current,
    total
) {

    if (
        total <= 7
    ) {

        return Array.from(
            {
                length: total
            },
            (_, i) =>
                i + 1
        );

    }


    const pages = [];


    pages.push(1);


    if (
        current > 4
    ) {

        pages.push("...");

    }


    const start =
        Math.max(
            2,
            current - 1
        );


    const end =
        Math.min(
            total - 1,
            current + 1
        );


    for (
        let i = start;
        i <= end;
        i++
    ) {

        pages.push(i);

    }


    if (
        current <
        total - 3
    ) {

        pages.push("...");

    }


    pages.push(total);


    return pages;

}


/* =========================================================
   LANGUAGE CHART
========================================================= */

function renderLanguageChart(
    repositories
) {

    const languageCounts = {};


    repositories.forEach(
        repo => {

            if (
                repo.language
            ) {

                languageCounts[
                    repo.language
                ] =
                    (
                        languageCounts[
                            repo.language
                        ] || 0
                    ) + 1;

            }

        }
    );


    const sorted =
        Object.entries(
            languageCounts
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    const total =
        sorted.reduce(
            (
                sum,
                item
            ) =>
                sum + item[1],
            0
        );


    if (
        total === 0
    ) {

        languageChart.innerHTML =
            "<p>Tidak ada data bahasa.</p>";

        return;

    }


    languageChart.innerHTML =
        sorted
            .slice(0, 10)
            .map(
                (
                    [
                        language,
                        count
                    ]
                ) => {

                    const percentage =
                        (
                            count /
                            total
                        ) *
                        100;


                    return `

                        <div class="language-row">

                            <div
                                class="language-row-header"
                            >

                                <span>
                                    ${escapeHTML(language)}
                                </span>

                                <span>
                                    ${count}
                                    repository
                                    ·
                                    ${percentage.toFixed(1)}%
                                </span>

                            </div>


                            <div
                                class="language-progress"
                            >

                                <span
                                    style="width:${percentage}%"
                                ></span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   RESET
========================================================= */

function resetAllFilters() {

    currentSearch = "";

    currentLanguage = "all";

    currentSort = "updated";

    currentPage = 1;


    searchInput.value = "";

    languageFilter.value =
        "all";

    sortSelect.value =
        "updated";


    clearSearch.classList.remove(
        "show"
    );


    applyFilters();

}


/* =========================================================
   THEME
========================================================= */

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            "tfaces-theme"
        );


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light"
        );

        themeToggle.innerHTML =
            `<i class="fa-solid fa-sun"></i>`;

    }

}


function toggleTheme() {

    document.body.classList.toggle(
        "light"
    );


    const isLight =
        document.body.classList.contains(
            "light"
        );


    localStorage.setItem(
        "tfaces-theme",
        isLight
            ? "light"
            : "dark"
    );


    themeToggle.innerHTML =
        isLight
            ? `<i class="fa-solid fa-sun"></i>`
            : `<i class="fa-solid fa-moon"></i>`;

}


/* =========================================================
   SCROLL
========================================================= */

function handleScroll() {

    if (
        window.scrollY > 500
    ) {

        backToTop.classList.add(
            "show"
        );

    } else {

        backToTop.classList.remove(
            "show"
        );

    }

}


backToTop.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    loadingScreen.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    setTimeout(
        () => {

            loadingScreen.classList.add(
                "hidden"
            );

        },
        400
    );

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    error
) {

    loadingScreen.classList.add(
        "hidden"
    );


    projectGrid.innerHTML = `

        <div
            style="
                grid-column:1/-1;
                text-align:center;
                padding:80px 20px;
            "
        >

            <div
                style="
                    font-size:50px;
                    margin-bottom:20px;
                "
            >
                ⚠️
            </div>

            <h2>
                Gagal mengambil data GitHub
            </h2>

            <p
                style="
                    color:var(--text-secondary);
                    margin:10px 0 20px;
                "
            >
                ${escapeHTML(error.message)}
            </p>

            <button
                class="btn btn-primary"
                onclick="location.reload()"
            >

                <i class="fa-solid fa-rotate"></i>

                Coba Lagi

            </button>

        </div>

    `;

}


/* =========================================================
   UTILITIES
========================================================= */

function formatNumber(
    number
) {

    return new Intl.NumberFormat(
        "id-ID"
    ).format(
        number || 0
    );

}


function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}
