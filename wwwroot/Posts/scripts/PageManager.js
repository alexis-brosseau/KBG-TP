class PageManager {
    // getItemsCallBack must return true when there is no more data to collect
    constructor(scrollPanelId, itemsPanelId, itemLayout, getItemsCallBack) {
        this.scrollPanel = $(`#${scrollPanelId}`);
        this.itemsPanel = $(`#${itemsPanelId}`);
        this.itemLayout = itemLayout;
        this.currentPage = { limit: -1, offset: -1 };
        this.resizeTimer = null;
        this.resizeEndTriggerDelai = 300;
        this.getItems = getItemsCallBack;
        this.installViewportReziseEvent();
        this.reset();
    }
    reset() {
        this.resetScrollPosition();
        this.update(false);
    }
    installViewportReziseEvent() {
        let instance = this;
        $(window).on('resize', function (e) {
            clearTimeout(instance.resizeTimer);
            instance.resizeTimer = setTimeout(() => { instance.update(false); }, instance.resizeEndTriggerDelai);
        });
    }
    setCurrentPageLimit() {
        let nbColumns = Math.trunc(this.scrollPanel.innerWidth() / this.itemLayout.width);
        if (nbColumns < 1) nbColumns = 1;
        let nbRows = Math.round(this.scrollPanel.innerHeight() / this.itemLayout.height);
        this.currentPage.limit = nbRows * nbColumns + nbColumns /* make sure to always have a content overflow */;
    }
    currentPageToQueryString(append = false) {
        
        if (!append) {
            this.setCurrentPageLimit();
            this.currentPage.offset = 0;
        }
        
        let offset = this.currentPage.offset;
        let limit = this.currentPage.limit;

        return `&limit=${limit}&offset=${offset}`;
    }
    scrollToElem(elemId) {
        this.scrollPanel.animate({
            scrollTop: $("#" + elemId).offset().top - this.scrollPanel.offset().top
        }, 300);
    }
    scrollPosition() {
        return document.body.scrollTop;
    }
    storeScrollPosition() {
        $(document).off();
        this.scrollPanel.off();
        this.previousScrollPosition = document.body.scrollTop;
    }
    resetScrollPosition() {
        this.currentPage.offset = 0;
        $(document).off();
        this.scrollPanel.off();
        document.body.scrollTop = 0;
    }
    restoreScrollPosition() {
        $(document).off();
        this.scrollPanel.off();
        document.body.scrollTop = this.previousScrollPosition;
    }
    async update(append = true) {
        this.storeScrollPosition();
        if (!append) this.itemsPanel.empty();
        let endOfData = await this.getItems(this.currentPageToQueryString(append));
        this.restoreScrollPosition();
        let instance = this;

        $(document).scroll(function () {
            if (!endOfData && $(document).scrollTop() + $(window).height() >= $(document).height() - 100) {
                console.log("Loading more data");
                $(document).off();
                instance.scrollPanel.off();
                instance.currentPage.offset++;
                instance.update(true);
            }
        });
    }
}