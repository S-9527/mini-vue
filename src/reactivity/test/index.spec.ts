import { it, expect } from "vitest";
import { add } from "../index";

it("init", () => {
    expect(true).toBe(true);
})

it('add', () => {
    expect(add(1,1)).toBe(2);
});