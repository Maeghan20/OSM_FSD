
const state = {
    data: null,
    page: "home",

    alignment: {
        offset: 0,
        recorded: false
    },

    road: {
        choice: "snap",
        recorded: false
    },

    tags: {
        name: "road near shop",
        highway: "residential",
        comment: "",
        recorded: false
    },

    submitted: false
};

const pageNames = {
    home: "FIELD GUIDE",
    alignment: "IMAGERY ALIGNMENT",
    roads: "ROAD CONNECTIONS",
    tags: "TAG INSPECTOR",
    review: "REVIEW DESK"
};

const $ = (id) => document.getElementById(id);

let toastTimer;

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

function showError() {
    $("loadingState").classList.add("hidden");
    $("appContent").classList.add("hidden");
    $("errorState").classList.remove("hidden");
}

async function loadData() {
    $("loadingState").classList.remove("hidden");
    $("errorState").classList.add("hidden");
    $("appContent").classList.add("hidden");

    try {
        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error("Could not load data.json");
        }

        const data = await response.json();

        if (!data.issues || data.issues.length < 3) {
            throw new Error("The sample issue data is incomplete.");
        }

        state.data = data;

        const roadIssue = data.issues.find(
            (item) => item.type === "road_connection"
        );

        if (roadIssue) {
            $("roadIssueTitle").textContent = roadIssue.title;
        }

        $("loadingState").classList.add("hidden");
        $("appContent").classList.remove("hidden");

        updateTagValidation();
        updateRoadPreview();
        updateAlignmentPreview();
        updateReview();
        goToPage(state.page);
    } catch (error) {
        console.error("Fieldwork data error:", error);
        showError();
    }
}

/* PAGE NAVIGATION */

function goToPage(page) {
    const validPages = ["home", "alignment", "roads", "tags", "review"];

    if (!validPages.includes(page)) {
        return;
    }

    state.page = page;

    document.querySelectorAll(".page").forEach((section) => {
        section.classList.toggle("active", section.id === `page-${page}`);
    });

    document.querySelectorAll(".nav-link").forEach((button) => {
        const active = button.dataset.page === page;
        button.classList.toggle("active", active);

        if (active) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    $("currentCrumb").textContent = pageNames[page];

    window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth"
    });

    if (page === "review") {
        updateReview();
    }
}

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");

    if (!button) {
        return;
    }

    event.preventDefault();
    goToPage(button.dataset.page);
});

/* IMAGERY ALIGNMENT */

function updateAlignmentPreview() {
    const imagery = $("imageryLayer");
    const slider = $("offsetSlider");

    if (!imagery || !slider) {
        return;
    }

    state.alignment.offset = Number(slider.value);

    imagery.style.transform =
        `translateX(${state.alignment.offset}px)`;

    $("offsetValue").textContent =
        `${state.alignment.offset > 0 ? "+" : ""}${state.alignment.offset} px`;

    if (state.alignment.offset === 0) {
        $("alignmentFeedback").textContent =
            "The imagery is at its starting position.";
    } else {
        $("alignmentFeedback").textContent =
            `Imagery preview shifted ${Math.abs(state.alignment.offset)} px ` +
            `${state.alignment.offset < 0 ? "left" : "right"}.`;
    }
}

$("offsetSlider").addEventListener("input", () => {
    state.alignment.recorded = false;
    state.submitted = false;

    updateAlignmentPreview();
    updateReview();

    $("alignmentStatusTitle").textContent = "Preview in progress";
    $("alignmentStatusText").textContent =
        "Record your chosen preview when you are ready.";

    $("saveAlignment").textContent = "Use this preview ↗";
});

$("resetOffset").addEventListener("click", () => {
    $("offsetSlider").value = 0;
    state.alignment.recorded = false;
    state.submitted = false;

    updateAlignmentPreview();
    updateReview();

    $("alignmentStatusTitle").textContent = "Preview reset";
    $("alignmentStatusText").textContent =
        "The imagery is back at its starting position.";

    $("saveAlignment").textContent = "Use this preview ↗";
    showToast("Imagery preview reset.");
});

$("saveAlignment").addEventListener("click", () => {
    state.alignment.recorded = true;
    state.submitted = false;

    $("alignmentStatusTitle").textContent = "Preview recorded";
    $("alignmentStatusText").textContent =
        "Your chosen offset is recorded in this session.";

    $("alignmentFeedback").textContent =
        `Preview recorded at ${state.alignment.offset} px. ` +
        "This does not change real map data.";

    $("saveAlignment").textContent = "Preview recorded ✓";

    updateReview();
    showToast("Imagery preview recorded.");
});

/* ROAD CONNECTIONS */

const repairDetails = {
    snap: {
        title: "Connect the road endpoints",
        text: "Bring the two endpoints together to create a continuous road. Only choose this when the roads physically connect."
    },

    bridge: {
        title: "Preview a bridge crossing",
        text: "A bridge represents a road passing over another road at a different level. A crossing should not automatically become a junction."
    },

    none: {
        title: "Leave the map unchanged",
        text: "When the evidence is unclear, making no change is a valid decision. Verify the location before editing the real map."
    }
};

function updateRoadPreview() {
    const choice = state.road.choice;

    document.querySelectorAll(".repair-option").forEach((button) => {
        const selected = button.dataset.repair === choice;

        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    $("repairExplanation").innerHTML = "";

    const title = document.createElement("strong");
    title.textContent = repairDetails[choice].title;

    const paragraph = document.createElement("p");
    paragraph.textContent = repairDetails[choice].text;

    $("repairExplanation").append(title, paragraph);

    const rightSegment = $("roadRightSegment");
    const rightLine = $("roadRightSegmentLine");

    if (choice === "snap") {
        rightSegment.setAttribute(
            "d",
            "M285 170 L450 122 L700 50"
        );

        rightLine.setAttribute(
            "d",
            "M285 170 L450 122 L700 50"
        );

        $("gapMarkers").classList.add("hidden");
        $("snapMarker").classList.remove("hidden");
        $("roadBridge").classList.add("hidden");

    } else if (choice === "bridge") {
        rightSegment.setAttribute(
            "d",
            "M325 159 L450 122 L700 50"
        );

        rightLine.setAttribute(
            "d",
            "M325 159 L450 122 L700 50"
        );

        $("gapMarkers").classList.remove("hidden");
        $("snapMarker").classList.add("hidden");
        $("roadBridge").classList.remove("hidden");

    } else {
        rightSegment.setAttribute(
            "d",
            "M325 159 L450 122 L700 50"
        );

        rightLine.setAttribute(
            "d",
            "M325 159 L450 122 L700 50"
        );

        $("gapMarkers").classList.remove("hidden");
        $("snapMarker").classList.add("hidden");
        $("roadBridge").classList.add("hidden");
    }

    if (state.road.recorded) {
        $("roadFeedback").textContent =
            `Decision recorded: ${repairDetails[choice].title}.`;
    } else {
        $("roadFeedback").textContent =
            "Preview only. Record your decision when ready.";
    }
}

document.querySelectorAll(".repair-option").forEach((button) => {
    button.addEventListener("click", () => {
        state.road.choice = button.dataset.repair;
        state.road.recorded = false;
        state.submitted = false;

        updateRoadPreview();
        updateReview();

        $("roadStatusTitle").textContent = "Preview in progress";
        $("roadStatusText").textContent =
            "Record your decision when you are ready.";
        $("saveRoad").textContent = "Record decision ↗";
    });
});

$("resetRoad").addEventListener("click", () => {
    state.road.choice = "snap";
    state.road.recorded = false;
    state.submitted = false;

    updateRoadPreview();
    updateReview();

    $("roadStatusTitle").textContent = "Preview reset";
    $("roadStatusText").textContent =
        "Choose the repair that best fits the evidence.";

    $("saveRoad").textContent = "Record decision ↗";
    showToast("Road preview reset.");
});

$("saveRoad").addEventListener("click", () => {
    state.road.recorded = true;
    state.submitted = false;

    $("roadStatusTitle").textContent = "Decision recorded";
    $("roadStatusText").textContent =
        repairDetails[state.road.choice].title;

    $("saveRoad").textContent = "Decision recorded ✓";

    updateRoadPreview();
    updateReview();

    showToast("Road decision recorded.");
});

/* TAG INSPECTOR */

function isTagValid() {
    const name = state.tags.name.trim();

    if (!name) {
        return true;
    }

    const words = name.toLowerCase().split(/\s+/);

    const descriptivePhrases = [
        "road near",
        "street near",
        "road beside",
        "street beside",
        "road behind",
        "street behind",
        "near shop",
        "near house",
        "unnamed road",
        "unknown road"
    ];

    const looksDescriptive = descriptivePhrases.some(
        (phrase) => name.toLowerCase().includes(phrase)
    );

    return !looksDescriptive && words.length <= 6;
}

function updateTagValidation() {
    const input = $("tagName");
    const validation = $("tagValidation");

    state.tags.name = input.value;
    state.tags.highway = $("tagHighway").value;
    state.tags.comment = $("tagComment").value;

    const valid = isTagValid();
    const commentValid = state.tags.comment.trim().length >= 15;

    validation.classList.toggle("valid", valid);

    const icon = validation.querySelector(".validation-icon");
    const heading = validation.querySelector("strong");
    const paragraph = validation.querySelector("p");

    if (!state.tags.name.trim()) {
        icon.textContent = "✓";
        heading.textContent = "Name left blank";
        paragraph.textContent =
            "No unverified name is being added. This is acceptable if the actual name is unknown.";
    } else if (valid) {
        icon.textContent = "✓";
        heading.textContent = "No obvious naming warning";
        paragraph.textContent =
            "The simple checker did not find a common descriptive phrase. This does not prove that the street name is correct.";
    } else {
        icon.textContent = "!";
        heading.textContent = "Something needs a closer look";
        paragraph.textContent =
            "This value looks like a description rather than a verified name. Verify the actual name or leave the field blank.";
    }

    $("saveTags").disabled = !valid || !commentValid;

    if (!commentValid) {
        $("tagFeedback").textContent =
            `Add a review note of at least 15 characters. ` +
            `${state.tags.comment.trim().length}/15 so far.`;
    } else if (!valid) {
        $("tagFeedback").textContent =
            "Review the street name before recording this check.";
    } else if (state.tags.recorded) {
        $("tagFeedback").textContent =
            "Tag review recorded. You can still make changes and record it again.";
    } else {
        $("tagFeedback").textContent =
            "Ready to record your tag review.";
    }
}

$("tagName").addEventListener("input", () => {
    state.tags.recorded = false;
    state.submitted = false;
    updateTagValidation();
    updateReview();
});

$("tagHighway").addEventListener("change", () => {
    state.tags.recorded = false;
    state.submitted = false;
    updateTagValidation();
    updateReview();
});

$("tagComment").addEventListener("input", () => {
    state.tags.recorded = false;
    state.submitted = false;
    updateTagValidation();
    updateReview();
});

$("resetTags").addEventListener("click", () => {
    $("tagName").value = "road near shop";
    $("tagHighway").value = "residential";
    $("tagComment").value = "";

    state.tags.recorded = false;
    state.submitted = false;

    updateTagValidation();
    updateReview();

    showToast("Sample tags restored.");
});

$("saveTags").addEventListener("click", () => {
    updateTagValidation();

    if (!isTagValid()) {
        showToast("Please review the street name first.");
        return;
    }

    if (state.tags.comment.trim().length < 15) {
        showToast("Please add a longer review note.");
        return;
    }

    state.tags.recorded = true;
    state.submitted = false;

    $("tagFeedback").textContent =
        "Tag review recorded. No real map data was changed.";

    updateReview();
    showToast("Tag review recorded.");
});

/* REVIEW DESK */

function setReviewRow(rowName, done, detail, label) {
    const status = $(`review${rowName}Status`);
    const detailElement = $(`review${rowName}Detail`);

    detailElement.textContent = detail;
    status.textContent = label;
    status.classList.toggle("done", done);
}

function updateReview() {
    const alignmentDone = state.alignment.recorded;
    const roadDone = state.road.recorded;
    const tagsDone = state.tags.recorded;

    const reviewedCount = [
        alignmentDone,
        roadDone,
        tagsDone
    ].filter(Boolean).length;

    $("reviewedCount").innerHTML =
        `${reviewedCount} <small>/ 3</small>`;

    $("navReviewCount").textContent = reviewedCount;

    setReviewRow(
        "Alignment",
        alignmentDone,
        alignmentDone
            ? `Imagery preview recorded at ${state.alignment.offset} px.`
            : "No preview recorded. Compare the image with the road lines.",
        alignmentDone ? "RECORDED" : "NOT REVIEWED"
    );

    setReviewRow(
        "Road",
        roadDone,
        roadDone
            ? repairDetails[state.road.choice].title
            : "No decision recorded. Inspect the road endpoints.",
        roadDone ? "RECORDED" : "NOT REVIEWED"
    );

    const tagValid = isTagValid();

    setReviewRow(
        "Tags",
        tagsDone,
        tagsDone
            ? `Name: ${state.tags.name.trim() || "(left blank)"}; road type: ${state.tags.highway}.`
            : tagValid
                ? "Inspect the tag fields and record your review note."
                : "The example street name needs attention.",
        tagsDone ? "RECORDED" : tagValid ? "NOT REVIEWED" : "NEEDS REVIEW"
    );

    const allDone = alignmentDone && roadDone && tagsDone;
    const comment = $("reviewComment").value.trim();
    const commentLength = comment.length;
    const minimumLength = state.data
        ? state.data.reviewRules.minimumCommentLength
        : 15;

    $("commentLength").textContent =
        `${commentLength} character${commentLength === 1 ? "" : "s"}`;

    $("reviewWarningCount").textContent = tagValid ? "0" : "1";

    $("submissionStatus").textContent =
        state.submitted
            ? "Complete"
            : allDone && commentLength >= minimumLength
                ? "Ready"
                : "Not ready";

    $("submitReview").disabled =
        !allDone || commentLength < minimumLength;

    const notice = $("submissionNotice");

    notice.classList.toggle("success", state.submitted);

    if (state.submitted) {
        notice.querySelector("span").textContent = "✓";
        notice.querySelector("p").textContent =
            "Your simulated review is complete. No changes were sent to OpenStreetMap.";
        $("reviewFeedback").textContent =
            "Review completed locally. This is a prototype, not a live submission.";
        $("submitReview").textContent = "Review completed ✓";
    } else {
        notice.querySelector("span").textContent = "i";
        notice.querySelector("p").textContent =
            !allDone
                ? `Record all three reviews first. ${reviewedCount} of 3 are recorded.`
                : commentLength < minimumLength
                    ? `Add at least ${minimumLength} characters to the review note.`
                    : "All required checks are recorded. You can complete the simulated review.";

        $("reviewFeedback").textContent =
            "Nothing has been submitted.";
        $("submitReview").innerHTML =
            'Complete simulated review <span>↗</span>';
    }
}

$("reviewComment").addEventListener("input", () => {
    state.submitted = false;
    updateReview();
});

$("submitReview").addEventListener("click", () => {
    updateReview();

    const allDone =
        state.alignment.recorded &&
        state.road.recorded &&
        state.tags.recorded;

    const comment = $("reviewComment").value.trim();
    const minimumLength = state.data.reviewRules.minimumCommentLength;

    if (!allDone) {
        showToast("Please record all three reviews first.");
        return;
    }

    if (comment.length < minimumLength) {
        showToast(
            `Please write at least ${minimumLength} characters in your note.`
        );
        return;
    }

    state.submitted = true;
    updateReview();

    showToast("Simulated review completed successfully.");
});

/* START */

$("retryButton").addEventListener("click", loadData);

loadData();
