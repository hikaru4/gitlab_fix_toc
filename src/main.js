var vm = {
    /* Detection if we are on GitLab page */
    isGitLab: function () {
        var isGitLab = document.querySelector("meta[content^='GitLab']");
        if (!isGitLab) {
            return false;
        } else {
            return true;
        }
    },
    isFilePage: function () {
        return $(".shortcuts-find-file").size() > 0 || ($(".file-holder").size() > 0 && $(".sub-nav li.active a").text().trim() === 'Files');
    },
    isIssuePage: function () {
        return $(".issue-details").size() > 0;
    },

    isIssueBoardsPage: function () {
        return $(".issue-boards-page").size() > 0;
    }
};

function addToc() {
    var fileContent = null,
        level = 1,
        prev_level = 1,
        i = 0,
        j = 0,
        toc = "",
        href = "";

    if (!vm.isGitLab() || !(vm.isFilePage() || vm.isIssuePage())) {
        return;
    }

    // waiting for md ready
    fileContent = document.getElementsByClassName('md')[0];

    if (typeof(fileContent) == "undefined") {
        window.setTimeout(checkFileReady, 100);
        return;
    }

    toc = "<div class='gitlab_toc ui-widget-content'>";
    toc += "<ul class='gitlab_toc_ul'>";
    prev_level = 1;
    for(i = 0; i < fileContent.childNodes.length; i++) {
        if(["H1", "H2", "H3", "H4", "H5"].includes(fileContent.childNodes[i].nodeName)) {
            level = fileContent.childNodes[i].nodeName[1];
            if (level > prev_level) {
                toc += "<ul class='gitlab_toc_ul'>";
            } else if (level < prev_level) {
                for(j = 0; j < prev_level - level; j++) {
                    toc += "</ul>";
                }
            }
            
            href = fileContent.childNodes[i].childNodes[1].getAttribute("href");
            toc += "<li><a href=\"" + href + "\">" + fileContent.childNodes[i].innerText + "</a></li>";
            prev_level = level;
        }
    }
    toc += "</ul></div>";

    if (prev_level > 1) {
        $("body").append($(toc));
        $(".gitlab_toc").resizable({handles: "all"});
        $(".gitlab_toc").draggable();
    }

    // 把 issue 後面直接加上 issue 標題
    $(".gfm-issue").each(function(){$(this).after(": " + this.getAttribute('title'))});
}

function addKanbanShortcut() {
    if (!vm.isGitLab()){
        return;
    }
    
    kanban_icon_url = chrome.runtime.getURL('images/kanban.png');
    kanban_url = $('a[title|="Board"').attr('href');
    kanban = '\n\
    <li class="">\n\
        <a class="shortcuts-boards" href="' + kanban_url + '">\n\
            <div class="nav-icon-container">\n\
                <img style="width: 16px;height: 16px;" src="' + kanban_icon_url + '">\n\
            </div>\n\
            <span class="nav-item-name">\n\
                Boards\n\
            </span>\n\
        </a>\n\
        <ul class="sidebar-sub-level-items is-fly-out-only">\n\
            \n\<li class="fly-out-top-item">\n\
                <a href="' + kanban_url + '">\n\
                    <strong class="fly-out-top-item-name">\n\
                        Boards\n\
                    </strong>\n\
                </a>\n\
            </li>\n\
        </ul>\n\
    </li>';
    $('.sidebar-top-level-items').prepend(kanban)

    $(document).on('keydown', function (e) {
        if ((e.altKey) && ( String.fromCharCode(e.which).toLowerCase() === 'c') ) {
            location.href = document.querySelector("a[title=Board]")
        }
    });
}

function setSidebarAsIssueIframe() { 
    if (!vm.isIssueBoardsPage()) {
        return;
    }

    // waiting for board card ready
    if ( $('.board-card').length === 0 ) {
        window.setTimeout(setSidebarAsIssueIframe, 100);
        return;
    }

    // set sidebar as issue iframe 
    $('.issuable-sidebar').remove();
    $('.issue-boards-sidebar').css('width','500px');
    $('.issue-boards-sidebar').append('<span aria-label="Fetching related merge requests" aria-hidden="true" class="spinner" style="z-index: 0;position: fixed;top: 50%;right: 240px;"></span>');

    // add click event to change iframe src
    $('.board-card').on("click", function(e) {
        var issueLink = $($(this).find('a')[0]).attr('href');
        var issueId = $(this).attr('data-issue-id');
        var issueIframeId = "issue_iframe_" + issueId;
        var issueIframe = $("#" + issueIframeId);

        if (issueIframe.length > 0) {
            $(".issue_iframe").hide();
            issueIframe.show();
        } else {
            $(".issue_iframe").hide();
            $(".issue-boards-sidebar").append('<iframe id="' + issueIframeId + '" class="issue_iframe" width="500px" height="100%" style="position: fixed;z-index: 50;" src="' + issueLink + '"></iframe>');
        }
    });

    // close sidebar while click other place
    $(".boards-list").click(function(e){
        //Do nothing if .header was not directly clicked
        if(e.target !== e.currentTarget){
            return;
        }
        $('#board-app').removeClass('is-compact')
        $('.board-card.is-active').removeClass('is-active');
        $('.right-sidebar').hide();
    });
}

function reverseNote() {
    var list, listItems;
    if (!vm.isIssuePage()) {
        return;
    }

    list = $('#notes-list');
    listItems = list.children('li');
    list.append(listItems.get().reverse());
}

function injectCss() {
    var array;
    if (!vm.isGitLab()){
        return;
    }

    array = ["css/jquery-ui.css", "css/main.css", "css/gitlab.css"];
    array.forEach(function (item, index) {
        var style_path = chrome.runtime.getURL(item);

        fetch(style_path)
            .then((response => response.text()))
            .then(function(text){
                var styleElement = document.createElement("style");
                styleElement.type = "text/css";
                styleElement.appendChild(document.createTextNode(text));
                document.getElementsByTagName("head")[0].appendChild(styleElement);
            });
    });
}

$(function () {
    $(window).on( "load", function() {
        addToc();
        addKanbanShortcut();
        setSidebarAsIssueIframe();
        reverseNote();
    });
});