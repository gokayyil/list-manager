import $ from "jquery";
(global as any).$ = $;

import { ListManager } from "../src/ListManager";

describe("ListManager", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
  });

  test("initializes with empty list", () => {
    const manager = new ListManager("#app");
    expect(manager.getItems()).toEqual([]);
    expect(document.querySelectorAll("li").length).toBe(0);
  });

  test("add a new item and update", () => {
    const manager = new ListManager("#app");
    manager.addItem("TestItem");

    const items = manager.getItems();
    const listElements = document.querySelectorAll("li");

    expect(items).toContain("TestItem");
    expect(listElements.length).toBe(1);
    expect(listElements[0].textContent).toContain("TestItem");
  });

  test("does not add empty or whitespace-only items", () => {
    const manager = new ListManager("#app");
    manager.addItem("");
    manager.addItem("   ");
    manager.addItem("TestItem");

    const items = manager.getItems();
    expect(items).toEqual(["TestItem"]);
    expect(document.querySelectorAll("li").length).toBe(1);
  });

  test("removes item correctly", () => {
    const manager = new ListManager("#app");
    manager.addItem("TestItem1");
    manager.addItem("TestItem2");
    manager.removeItem(0);

    const items = manager.getItems();
    expect(items).toEqual(["TestItem2"]);
    expect(document.querySelectorAll("li").length).toBe(1);
  });

  test("clear() removes all items and clears list", () => {
    const manager = new ListManager("#app");
    manager.addItem("TestItem1");
    manager.addItem("TestItem2");
    manager.clear();

    const items = manager.getItems();
    const listElements = document.querySelectorAll("li");

    expect(items.length).toBe(0);
    expect(listElements.length).toBe(0);
  });

  test("clicking Add button adds an item via event binding", () => {
    const manager = new ListManager("#app");

    const input = document.querySelector("#itemInput") as HTMLInputElement;
    input.value = "TestItem";

    const addButton = document.querySelector("#addItem") as HTMLButtonElement;
    addButton.click();

    expect(manager.getItems()).toContain("TestItem");
    expect(document.querySelectorAll("li").length).toBe(1);
  });

  test("does not add duplicate items", () => {
    const manager = new ListManager("#app");
    manager.addItem("TestItem");
    manager.addItem("TestItem");
    expect(manager.getItems()).toEqual(["TestItem"]);
    expect(document.querySelectorAll("li").length).toBe(1);
  });

  test("pressing Enter key adds an item", () => {
    const manager = new ListManager("#app");
    const input = document.querySelector("#itemInput") as HTMLInputElement;
    input.value = "KeyboardItem";
    const keyEvent = new KeyboardEvent("keypress", { which: 13 });
    input.dispatchEvent(keyEvent);
    expect(manager.getItems()).toContain("KeyboardItem");
  });

  test("throws error for invalid container ID", () => {
    expect(() => new ListManager("#nonexistent")).toThrow("ListManager: container not found.");
  });

});
