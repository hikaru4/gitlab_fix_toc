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


function checkFileReady() {
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

    fileContent = document.getElementsByClassName('md')[0];

    if (typeof(fileContent) == "undefined") {
        window.setTimeout(checkFileReady, 100);
    } else {
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
        $("body").append($(toc));

        $(".gitlab_toc").resizable({handles: "all"});
        $(".gitlab_toc").draggable();
    }

    // 把 issue 後面直接加上 issue 標題
    $(".gfm-issue").each(function(){$(this).after(": " + this.getAttribute('title'))});
}

function addKanbanShortcut() {
    kanban_icon_url = chrome.extension.getURL('images/kanban.png');
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

    $(document).on('keydown', function ( e ) {
        if ((e.altKey) && ( String.fromCharCode(e.which).toLowerCase() === 'c') ) {
            location.href = document.querySelector("a[title=Board]")
        }
    });
}

$(function () {
    checkFileReady();
    addKanbanShortcut();
});
