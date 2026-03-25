import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "call"
): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName,
    args,
    state,
  } as ToolInvocation;
}

test("shows 'Creating' label for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/components/Button.jsx" })}
    />
  );
  expect(screen.getByText("Creating Button.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor insert command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Reading' label for str_replace_editor view command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Reading App.jsx")).toBeDefined();
});

test("shows 'Undoing changes' label for str_replace_editor undo_edit command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Undoing changes to App.jsx")).toBeDefined();
});

test("shows 'Deleting' label for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/components/OldComponent.jsx" })}
    />
  );
  expect(screen.getByText("Deleting OldComponent.jsx")).toBeDefined();
});

test("shows 'Renaming' label for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "/components/OldName.jsx",
        new_path: "/components/NewName.jsx",
      })}
    />
  );
  expect(screen.getByText("Renaming OldName.jsx to NewName.jsx")).toBeDefined();
});

test("falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("some_unknown_tool", {})}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("shows spinner when state is 'call'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("shows green dot when state is 'result'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
