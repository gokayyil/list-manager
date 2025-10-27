declare const $: JQueryStatic;

export interface IListManager {
    addItem(item: string, input?: JQuery<HTMLElement>): void;
    removeItem(index: number): void;
    getItems(): string[];
    clear(): void;
}

export class ListManager implements IListManager {
    private items: string[];
    private readonly $container: JQuery<HTMLElement>;

    private static readonly ENTER_KEY_CODE = 13;
    private static readonly MAX_ITEM_LENGTH = 30;

    private static readonly SELECTORS = {
        INPUT: "#itemInput",
        ADD_BTN: "#addItem",
        CLEAR_BTN: "#clearAll",
        LIST: "#itemList"
    } as const;

    private static readonly ERRORS = {
        CONTAINER_NOT_FOUND: "ListManager: container not found.",
        INPUT_NOT_FOUND: "ListManager: input field not found.",
        LIST_NOT_FOUND: "ListManager: list container not found.",
        INDEX_OUT_OF_RANGE: "ListManager: invalid index."
    } as const;

    constructor(containerId: string) {
        const $el = $(containerId);
        if ($el.length === 0) throw new Error(ListManager.ERRORS.CONTAINER_NOT_FOUND);

        this.$container = $el;
        this.items = [];

        this.renderUI();
        this.bindEvents();
    }

    private renderUI(): void {
        if (!this.$container || this.$container.length === 0) {
            throw new Error(ListManager.ERRORS.CONTAINER_NOT_FOUND);
        }

        this.$container.empty();

        const $wrapper = $("<div>")
            .addClass("container mt-4")
            .css("max-width", "500px");

        const $inputRow = $("<div>").addClass("input-group mb-3");

        const $input = $("<input>")
            .addClass("form-control")
            .attr({
                type: "text",
                id: "itemInput",
                placeholder: "Enter item",
                maxlength: ListManager.MAX_ITEM_LENGTH,
                "aria-label": "New item",
                autocomplete: "off",
            });

        const $addBtn = $("<button>")
            .addClass("btn btn-primary")
            .attr({ id: "addItem", type: "button" })
            .text("Add Item");

        const $clearBtn = $("<button>")
            .addClass("btn btn-danger")
            .attr({ id: "clearAll", type: "button" })
            .text("Clear All");

        const $btnGroup = $("<div>").addClass("btn-group gap-1").append($addBtn, $clearBtn);
        $inputRow.append($input, $btnGroup);

        const $list = $("<ul>").addClass("list-group").attr("id", "itemList");

        $wrapper.append($inputRow, $list);
        this.$container.append($wrapper);
        this.$container.attr("data-component", "list-manager");
    }


    private bindEvents(): void {
        if (!this.$container || this.$container.length === 0) {
            throw new Error(ListManager.ERRORS.CONTAINER_NOT_FOUND);
        }

        const { INPUT, ADD_BTN, CLEAR_BTN } = ListManager.SELECTORS;

        const $input = this.$container.find(INPUT);
        const $add = this.$container.find(ADD_BTN);
        const $clear = this.$container.find(CLEAR_BTN);

        $add.on("click", () => this.handleAddItem());
        $clear.on("click", () => this.clear());
        $input.on("keypress", (e) => {
            if (e.which === ListManager.ENTER_KEY_CODE) {
                this.handleAddItem();
            }
        });
    }

    private handleAddItem(): void {
        const $input = this.$container.find(ListManager.SELECTORS.INPUT);
        if ($input.length === 0) throw new Error(ListManager.ERRORS.INPUT_NOT_FOUND);

        const value = $input.val()?.toString().trim() ?? "";
        if (!value) {
            this.showToast("Please enter a value.", "warning");
            return;
        }

        this.addItem(value, $input);
    }

    public addItem(item: string, input?: JQuery<HTMLElement>): void {
        const trimmed = item.trim();
        if (!trimmed) return;

        const isDuplicate = this.items.some(item => item.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
            this.showToast(`"${trimmed}" already exists.`, "danger");
            return;
        }

        this.items.push(trimmed);
        this.appendListItem(trimmed, this.items.length - 1);
        this.showToast(`Item "${trimmed}" added.`, "success");
        if (input && input.length > 0) {
            input.val("").trigger("focus");
        }
    }

    public removeItem(index: number): void {
        if (index < 0 || index >= this.items.length) throw new Error(ListManager.ERRORS.INDEX_OUT_OF_RANGE);
        const itemName = this.items[index];
        this.items.splice(index, 1);
        this.$container.find(`${ListManager.SELECTORS.LIST} li`).eq(index).remove();


        const $buttons = this.$container.find(`${ListManager.SELECTORS.LIST} button`);
        $buttons.each((i, btn) => {
            $(btn).off("click").on("click", () => this.removeItem(i));
        });
        this.showToast(`Item "${itemName}" removed.`, "success");
    }

    public getItems(): string[] {
        return [...this.items];
    }

    public clear(): void {
        if (this.items.length === 0) {
            this.showToast("List is already empty.", "info");
            return;
        }

        this.items = [];
        this.$container.find(ListManager.SELECTORS.LIST).empty();
        this.showToast("List has been cleared.", "success");
    }

    private showToast(
        message: string,
        type: "success" | "info" | "warning" | "danger" = "info"
    ): void {
        const $container = $("#toastContainer");
        if ($container.length === 0) {
            console.error("Toast container not found");
            return;
        }

        const $toast = $(`
            <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            </div>
        `);

        $container.append($toast);

        const toastEl = $toast[0] as HTMLElement;
        // @ts-ignore
        const toast = new bootstrap.Toast(toastEl, { delay: 1500 });
        toast.show();

        $toast.on("hidden.bs.toast", () => $toast.remove());
    }


    private appendListItem(item: string, index: number): void {
        const $list = this.$container.find(ListManager.SELECTORS.LIST);
        const $li = $("<li>")
            .addClass("list-group-item d-flex justify-content-between align-items-center text-truncate")
            .text(item);

        const $removeBtn = $("<button>")
            .addClass("btn btn-danger btn-sm")
            .attr("aria-label", `Remove ${item}`)
            .text("✕")
            .on("click", () => this.removeItem(index));

        $li.append($removeBtn);
        $list.append($li);
    }

}
