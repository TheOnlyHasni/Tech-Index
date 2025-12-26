import * as params from '@params';

let fuse; // holds our search engine
let resList = document.getElementById('searchResults');
let sInput = document.getElementById('searchInput');
let first, last, current_elem = null
let resultsAvailable = false;

// load our search index
window.onload = function () {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data) {
                    // fuse.js options; check fuse.js website for details
                    let options = {
                        distance: 100,
                        threshold: 0.5,
                        includeScore: true,
                        ignoreLocation: true,
                        keys: [
                            { name: 'title', weight: 1.0 },
                            { name: 'tags', weight: 0.8 },
                            { name: 'categories', weight: 0.8 },
                            { name: 'author', weight: 0.6 },
                            { name: 'summary', weight: 0.2 }
                        ]
                    };
                    if (params.fuseOpts) {
                        options = {
                            isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
                            includeScore: true,
                            includeMatches: params.fuseOpts.includematches ?? false,
                            minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
                            shouldSort: params.fuseOpts.shouldsort ?? true,
                            findAllMatches: params.fuseOpts.findallmatches ?? false,
                            keys: [
                                { name: 'title', weight: 1.0 },
                                { name: 'tags', weight: 0.8 },
                                { name: 'categories', weight: 0.8 },
                                { name: 'author', weight: 0.6 },
                                { name: 'summary', weight: 0.2 }
                            ],
                            location: params.fuseOpts.location ?? 0,
                            threshold: params.fuseOpts.threshold ?? 0.5,
                            distance: params.fuseOpts.distance ?? 100,
                            ignoreLocation: params.fuseOpts.ignorelocation ?? true
                        }
                    }
                    fuse = new Fuse(data, options); // build the index from the json file

                    // Check for query parameter on load
                    const urlParams = new URLSearchParams(window.location.search);
                    const query = urlParams.get('q');
                    if (query) {
                        sInput.value = query;
                        sInput.dispatchEvent(new Event('keyup'));
                    }
                }
            } else {
                console.log(xhr.responseText);
            }
        }
    };
    xhr.open('GET', "../index.json");
    xhr.send();
}

function activeToggle(ae) {
    document.querySelectorAll('.focus').forEach(function (element) {
        // rm focus class
        element.classList.remove("focus")
    });
    if (ae) {
        ae.focus()
        document.activeElement = current_elem = ae;
        ae.parentElement.classList.add("focus")
    } else {
        document.activeElement.parentElement.classList.add("focus")
    }
}

function reset() {
    resultsAvailable = false;
    resList.innerHTML = sInput.value = ''; // clear inputbox and searchResults
    sInput.focus(); // shift focus to input box
}

// execute search as each character is typed
sInput.onkeyup = function (e) {
    if (fuse) {
        let results;
        if (params.fuseOpts) {
            results = fuse.search(this.value.trim(), { limit: params.fuseOpts.limit });
        } else {
            results = fuse.search(this.value.trim());
        }

        if (results.length !== 0) {
            let relevant = [];
            let suggested = [];

            results.forEach(res => {
                // Score < 0.35 is generally a very strong match for titles/tags
                if (res.score < 0.35) {
                    relevant.push(res.item);
                } else if (suggested.length < 5) {
                    suggested.push(res.item);
                }
            });

            // Sort relevant: "posts" and "tutorials" first
            const sortBySection = (a, b) => {
                const prioritySections = ['posts', 'tutorials'];
                const aIsPriority = prioritySections.includes(a.section);
                const bIsPriority = prioritySections.includes(b.section);
                if (aIsPriority && !bIsPriority) return -1;
                if (!aIsPriority && bIsPriority) return 1;
                return 0;
            };

            relevant.sort(sortBySection);

            let resultSet = '';

            const renderItem = (item) => {
                const prioritySections = ['posts', 'tutorials'];
                const isPrimary = prioritySections.includes(item.section);
                const hasImage = isPrimary && item.image && item.image !== "";
                const cardClass = hasImage ? "search-result-card has-image" : "search-result-card no-image";
                const bgStyle = hasImage ? `style="background-image: url('${item.image}')"` : "";

                return `<li class="${cardClass}" ${bgStyle}>
                    <div class="entry-overlay">
                        <header class="entry-header">
                            <h2 class="result-title">${item.title}</h2>
                        </header>
                        <div class="result-content">
                            <p>${item.summary || ""}</p>
                        </div>
                    </div>
                    <a href="${item.permalink}" aria-label="${item.title}"></a>
                </li>`;
            };

            if (relevant.length > 0) {
                relevant.forEach(item => {
                    resultSet += renderItem(item);
                });
            }

            if (suggested.length > 0) {
                resultSet += `<li class="search-divider">
                    <h3>You Might Also Like</h3>
                </li>`;
                suggested.forEach(item => {
                    resultSet += renderItem(item);
                });
            }

            resList.innerHTML = resultSet;
            resultsAvailable = true;
            first = resList.firstChild;
            last = resList.lastChild;
        } else {
            resultsAvailable = false;
            resList.innerHTML = '<li class="no-results-message">No results found</li>';
        }
    }
}

sInput.addEventListener('search', function (e) {
    if (!this.value) reset()
})

document.onkeydown = function (e) {
    let key = e.key;
    let ae = document.activeElement;
    let inbox = document.getElementById("searchbox").contains(ae)

    if (ae === sInput) {
        let elements = document.getElementsByClassName('focus');
        while (elements.length > 0) {
            elements[0].classList.remove('focus');
        }
    } else if (current_elem) ae = current_elem;

    if (key === "Escape") {
        reset()
    } else if (!resultsAvailable || !inbox) {
        return
    } else if (key === "ArrowDown") {
        e.preventDefault();
        if (ae == sInput) {
            activeToggle(resList.firstChild.lastChild);
        } else if (ae.parentElement != last) {
            activeToggle(ae.parentElement.nextSibling.lastChild);
        }
    } else if (key === "ArrowUp") {
        e.preventDefault();
        if (ae.parentElement == first) {
            activeToggle(sInput);
        } else if (ae != sInput) {
            activeToggle(ae.parentElement.previousSibling.lastChild);
        }
    } else if (key === "ArrowRight") {
        ae.click();
    }
}
