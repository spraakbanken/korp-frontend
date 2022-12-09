// this stuff is just saved to be ported to the new KWIC component later

$(document).keydown($.proxy(this.onKeydown, this))

onKeydown(event) {
    let next
    const isSpecialKeyDown = event.shiftKey || event.ctrlKey || event.metaKey
    if (isSpecialKeyDown || $("input, textarea, select").is(":focus") || !this.$result.is(":visible")) {
        return
    }

    switch (event.which) {
        case 78: // n
            safeApply(this.s, () => {
                this.s.$parent.pageChange(this.s.$parent.page + 1)
            })
            return false
        case 70: // f
            if (this.s.$parent.page === 0) {
                return
            }
            safeApply(this.s, () => {
                this.s.$parent.pageChange(this.s.$parent.page - 1)
            })
            return false
    }
    if (!this.selectionManager.hasSelected()) {
        return
    }
    switch (event.which) {
        case 38: // up
            next = this.selectUp()
            break
        case 39: // right
            next = this.selectNext()
            break
        case 37: // left
            next = this.selectPrev()
            break
        case 40: // down
            next = this.selectDown()
            break
    }

    if (next) {
        this.scrollToShowWord($(next))
        return false
    }
}

selectNext() {
    let next
    if (!this.isReadingMode()) {
        const i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0))
        next = this.getCurrentRow().get(i + 1)
        if (next == null) {
            return
        }
        $(next).click()
    } else {
        next = this.$result.find(".token_selected").next().click()
    }
    return next
}

selectPrev() {
    let prev
    if (!this.isReadingMode()) {
        const i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0))
        if (i === 0) {
            return
        }
        prev = this.getCurrentRow().get(i - 1)
        $(prev).click()
    } else {
        prev = this.$result.find(".token_selected").prev().click()
    }
    return prev
}

selectUp() {
    let prevMatch
    const current = this.selectionManager.selected
    if (!this.isReadingMode()) {
        prevMatch = this.getWordAt(
            current.offset().left + current.width() / 2,
            current.closest("tr").prevAll(".not_corpus_info").first()
        )
        prevMatch.click()
    } else {
        const searchwords = current
            .prevAll(".word")
            .get()
            .concat(
                current
                    .closest(".not_corpus_info")
                    .prevAll(".not_corpus_info")
                    .first()
                    .find(".word")
                    .get()
                    .reverse()
            )
        const def = current.parent().prev().find(".word:last")
        prevMatch = this.getFirstAtCoor(current.offset().left + current.width() / 2, $(searchwords), def).click()
    }

    return prevMatch
}

selectDown() {
    let nextMatch
    const current = this.selectionManager.selected
    if (!this.isReadingMode()) {
        nextMatch = this.getWordAt(
            current.offset().left + current.width() / 2,
            current.closest("tr").nextAll(".not_corpus_info").first()
        )
        nextMatch.click()
    } else {
        const searchwords = current
            .nextAll(".word")
            .add(current.closest(".not_corpus_info").nextAll(".not_corpus_info").first().find(".word"))
        const def = current.parent().next().find(".word:first")
        nextMatch = this.getFirstAtCoor(current.offset().left + current.width() / 2, searchwords, def).click()
    }
    return nextMatch
}

getCurrentRow() {
    const tr = this.$result.find(".token_selected").closest("tr")
    if (this.$result.find(".token_selected").parent().is("td")) {
        return tr.find("td > .word")
    } else {
        return tr.find("div > .word")
    }
}

getFirstAtCoor(xCoor, wds, default_word) {
    let output = null
    wds.each(function (i, item) {
        const thisLeft = $(this).offset().left
        const thisRight = $(this).offset().left + $(this).width()
        if (xCoor > thisLeft && xCoor < thisRight) {
            output = $(this)
            return false
        }
    })

    return output || default_word
}

getWordAt(xCoor, $row) {
    let output = $()
    $row.find(".word").each(function () {
        output = $(this)
        const thisLeft = $(this).offset().left
        const thisRight = $(this).offset().left + $(this).width()
        if ((xCoor > thisLeft && xCoor < thisRight) || thisLeft > xCoor) {
            return false
        }
    })

    return output
}

// If an error occurred or the result is otherwise empty,
// deselect word and hide the sidebar
if (!this.hasData || !data.kwic || !data.kwic.length) {
    this.selectionManager.deselect()
    statemachine.send("DESELECT_WORD")
}


scrollToShowWord(word) {
    if (!word.length) {
        return
    }
    const offset = 200
    const wordTop = word.offset().top
    let newY = window.scrollY
    if (wordTop > $(window).height() + window.scrollY) {
        newY += offset
    } else if (wordTop < window.scrollY) {
        newY -= offset
    }
    $("html, body").stop(true, true).animate({ scrollTop: newY })
    const wordLeft = word.offset().left
    const area = this.$result.find(".table_scrollarea")
    let newX = Number(area.scrollLeft())
    if (wordLeft > area.offset().left + area.width()) {
        newX += offset
    } else if (wordLeft < area.offset().left) {
        newX -= offset
    }
    return area.stop(true, true).animate({ scrollLeft: newX })
}