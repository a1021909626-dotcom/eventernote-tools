import { describe, expect, it } from "vitest";
import { parseFavoriteActors } from "../src/parsers/favorite-actors.js";

describe("favorite actor parser", () => {
  it("extracts actor anchors from favorite actor edit HTML without using form actions", () => {
    const html = `
      <html><body>
        <form action="/users/favorite_actors">
          <ul>
            <li><a href="/actors/Raychell/16232">Raychell</a></li>
            <li><a href="/actors/RAISE%20A%20SUILEN/39397">RAISE A SUILEN</a></li>
          </ul>
          <input type="submit" value="保存">
        </form>
      </body></html>
    `;
    expect(parseFavoriteActors(html).map((actor) => actor.actorId)).toEqual(["16232", "39397"]);
  });
});
