// Keys are Substrings as diplayed by navigator.platform
var supportedOperatingSystems = new Map([
  ['linux', 'linux'],
  ['mac', 'macos'],
  ['win', 'windows'],
]);

var opts = {
  cuda: 'cudanone',
  os: getAnchorSelectedOS() || getDefaultSelectedOS(),
  pm: 'conda',
  language: 'python',
  tvmbuild: 'preview',
};

var os = $(".os > .option");
var package = $(".package > .option");
var language = $(".language > .option");
var cuda = $(".cuda > .option");
var tvmbuild = $(".tvmbuild > .option");

os.on("click", function() {
  selectedOption(os, this, "os");
});
package.on("click", function() {
  selectedOption(package, this, "pm");
});
language.on("click", function() {
  selectedOption(language, this, "language");
});
cuda.on("click", function() {
  selectedOption(cuda, this, "cuda");
});
tvmbuild.on("click", function() {
  selectedOption(tvmbuild, this, "tvmbuild")
});

// Pre-select user's operating system
$(function() {
  var userOsOption = document.getElementById(opts.os);
  if (userOsOption) {
    $(userOsOption).trigger("click")
  }
});


// determine os (mac, linux, windows) based on user's platform
function getDefaultSelectedOS() {
  var platform = navigator.platform.toLowerCase();
  for (var [navPlatformSubstring, os] of supportedOperatingSystems.entries()) {
    if (platform.indexOf(navPlatformSubstring) !== -1) {
      return os;
    }
  }
  // Just return something if user platform is not in our supported map
  return supportedOperatingSystems.values().next().value;
}

// determine os based on location hash
function getAnchorSelectedOS() {
  var anchor = location.hash;
  var ANCHOR_REGEX = /^#[^ ]+$/;
  // Look for anchor in the href
  if (!ANCHOR_REGEX.test(anchor)) {
    return false;
  }
  // Look for anchor with OS in the first portion
  var testOS = anchor.slice(1).split("-")[0];
  for (var [navPlatformSubstring, os] of supportedOperatingSystems.entries()) {
    if (testOS.indexOf(navPlatformSubstring) !== -1) {
      return os;
    }
  }
  return false;
}

function selectedOption(option, selection, category) {
  $(option).removeClass("selected");
  $(selection).addClass("selected");
  opts[category] = selection.id;
  if (category === "pm") {
  }

  commandMessage(buildMatcher());
  if (category === "os") {
    display(opts.os, 'installation', 'os');
  }
}

function display(selection, id, category) {
  var container = document.getElementById(id);
  // Check if there's a container to display the selection
  if (container === null) {
    return;
  }
  var elements = container.getElementsByClassName(category);
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].classList.contains(selection)) {
      $(elements[i]).addClass("selected");
    } else {
      $(elements[i]).removeClass("selected");
    }
  }
}

function buildMatcher() {
  return (
    opts.tvmbuild.toLowerCase() +
    "," +
    opts.pm.toLowerCase() +
    "," +
    opts.os.toLowerCase() +
    "," +
    opts.cuda.toLowerCase() +
    "," +
    opts.language.toLowerCase()
  );
}

function setupMapping() {
  var object = {}
  for (var platform of ["windows", "linux", "macos"]) {
    for (var ver of ["preview", "stable"]) {
      for (var cuda of ["none", "10.0", "10.1", "10.2"]) {
        const conda_key = ver + ",conda," + platform + ",cuda" + cuda + ",python";
        const pip_key = ver + ",pip," + platform + ",cuda" + cuda + ",python";

        var name = "tlcpack";
        if (ver == "preview") {
          name = name + "-nightly";
        }
        if (cuda != "none") {
          // cuda specific version
          name = name + "-cu" + cuda.split(".").join("");
        }
        const conda_enabled = ((platform != "linux" && cuda == "none") ||
                               (platform == "linux"));

        const pip_enabled = ((platform != "linux" && cuda == "none") ||
                             (platform == "linux" && ver == "preview"));

        if (conda_enabled) {
          object[conda_key] = "conda install " + name + " -c tlcpack";
        }
        if (pip_enabled) {
          object[pip_key] = "pip install " + name + " -f https://tlcpack.ai/wheels";
        }
      }
    }
  }
  return object;
}

var commandMap = setupMapping();

function commandMessage(key) {
  if (!commandMap.hasOwnProperty(key)) {
    $("#command").html(
      "<pre> # Follow instructions at this URL: https://tvm.apache.org/docs/install/from_source.html </pre>"
    );
  } else {
    $("#command").html("<pre>" + commandMap[key] + "</pre>");
  }
}
