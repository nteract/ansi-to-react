import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as React from "react";
import Ansi from "../src/index";

const GREEN_FG = "\u001b[32m";
const YELLOW_BG = "\u001b[43m";
const BOLD = "\u001b[1m";
const RESET = "\u001b[0;m";

describe("Ansi", () => {
  test("hello world", () => {
    const { container } = render(
      React.createElement(Ansi, null, "hello world"),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("hello world");
  });

  test("can color", () => {
    const { container } = render(
      React.createElement(Ansi, null, `hello ${GREEN_FG}world`),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("hello world");
    expect(container.innerHTML).toBe(
      '<code><span>hello </span><span style="color: rgb(0, 187, 0);">world</span></code>',
    );
  });

  test("can have className", () => {
    const { container } = render(
      React.createElement(Ansi, { className: "my-class" }, "hello world"),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("hello world");
    expect(codeElement).toHaveClass("my-class");
    expect(container.innerHTML).toBe(
      '<code class="my-class"><span>hello world</span></code>',
    );
  });

  test("can nest", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        null,
        `hello ${GREEN_FG}wo${YELLOW_BG}rl${RESET}d`,
      ),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("hello world");
    expect(container.innerHTML).toBe(
      '<code><span>hello </span><span style="color: rgb(0, 187, 0);">wo</span><span style="background-color: rgb(187, 187, 0); color: rgb(0, 187, 0);">rl</span><span>d</span></code>',
    );
  });

  test("can handle carriage symbol", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        null,
        "this sentence\rthat\nwill make you pause",
      ),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    // Use textContent property directly to preserve newlines
    expect(codeElement?.textContent).toBe("that sentence\nwill make you pause");
  });

  test("can handle backspace symbol", () => {
    const { container } = render(
      React.createElement(Ansi, null, "01hello\b goodbye"),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("01hell goodbye");
  });

  // see https://stackoverflow.com/questions/55440152/multiple-b-doesnt-work-as-expected-in-jupyter#
  test("handles backspace symbol in same funny way as Jupyter Classic -- 1/2", () => {
    const { container } = render(
      React.createElement(Ansi, null, "02hello\b\b goodbye"),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("02hel goodbye");
  });

  test("handles backspace symbol in same funny way as Jupyter Classic -- 2/2", () => {
    const { container } = render(
      React.createElement(Ansi, null, "03hello\b\b\b goodbye"),
    );
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("03hell goodbye");
  });

  test("can linkify", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "this is a link: https://nteract.io/",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElement = container.querySelector("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent(
      "this is a link: https://nteract.io/",
    );
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "https://nteract.io/");
    expect(linkElement).toHaveAttribute("target", "_blank");
    expect(container.innerHTML).toBe(
      '<code><span>this is a link: <a href="https://nteract.io/" target="_blank">https://nteract.io/</a></span></code>',
    );
  });

  test("can linkify links starting with www.", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "this is a link: www.google.com",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElement = container.querySelector("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("this is a link: www.google.com");
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "http://www.google.com");
    expect(linkElement).toHaveAttribute("target", "_blank");
    expect(container.innerHTML).toBe(
      '<code><span>this is a link: <a href="http://www.google.com" target="_blank">www.google.com</a></span></code>',
    );
  });

  test("doesn't linkify partial matches", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "cant click this link: 'http://www.google.com'",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElement = container.querySelector("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent(
      "cant click this link: 'http://www.google.com'",
    );
    expect(linkElement).not.toBeInTheDocument();
    expect(container.innerHTML).toBe(
      "<code><span>cant click this link: 'http://www.google.com'</span></code>",
    );
  });

  test("can distinguish URL-ish text", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "<transport.model.TransportInfo",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElement = container.querySelector("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("<transport.model.TransportInfo");
    expect(linkElement).not.toBeInTheDocument();
  });

  test("can distinguish URL-ish text", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElement = container.querySelector("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent(
      "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>",
    );
    expect(linkElement).not.toBeInTheDocument();
  });

  test("can linkify multiple links", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "this is a link: www.google.com and this is a second link: www.microsoft.com",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElements = container.querySelectorAll("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent(
      "this is a link: www.google.com and this is a second link: www.microsoft.com",
    );
    expect(linkElements).toHaveLength(2);
    expect(linkElements[0]).toHaveAttribute("href", "http://www.google.com");
    expect(linkElements[1]).toHaveAttribute("href", "http://www.microsoft.com");
    expect(container.innerHTML).toBe(
      '<code><span>this is a link: <a href="http://www.google.com" target="_blank">www.google.com</a> and this is a second link: <a href="http://www.microsoft.com" target="_blank">www.microsoft.com</a></span></code>',
    );
  });

  test("creates a minimal number of nodes when using linkify", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "this is a link: www.google.com and this is text after",
      ),
    );
    const codeElement = container.querySelector("code");
    const spanElement = codeElement?.querySelector("span");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent(
      "this is a link: www.google.com and this is text after",
    );
    expect(spanElement?.childNodes).toHaveLength(3);
  });

  test("can linkify multiple links one after another", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "www.google.com www.google.com www.google.com",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElements = container.querySelectorAll("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent(
      "www.google.com www.google.com www.google.com",
    );
    expect(linkElements).toHaveLength(3);
    expect(container.innerHTML).toBe(
      '<code><span><a href="http://www.google.com" target="_blank">www.google.com</a> <a href="http://www.google.com" target="_blank">www.google.com</a> <a href="http://www.google.com" target="_blank">www.google.com</a></span></code>',
    );
  });

  test("can handle URLs inside query parameters", () => {
    const { container } = render(
      React.createElement(
        Ansi,
        { linkify: true },
        "www.google.com/?q=https://www.google.com",
      ),
    );
    const codeElement = container.querySelector("code");
    const linkElement = container.querySelector("a");

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent(
      "www.google.com/?q=https://www.google.com",
    );
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute(
      "href",
      "http://www.google.com/?q=https://www.google.com",
    );
    expect(container.innerHTML).toBe(
      '<code><span><a href="http://www.google.com/?q=https://www.google.com" target="_blank">www.google.com/?q=https://www.google.com</a></span></code>',
    );
  });

  describe("useClasses options", () => {
    test("can add the font color class", () => {
      const { container } = render(
        React.createElement(
          Ansi,
          { useClasses: true },
          `hello ${GREEN_FG}world`,
        ),
      );
      const codeElement = container.querySelector("code");
      const coloredSpan = container.querySelector(".ansi-green-fg");

      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveTextContent("hello world");
      expect(coloredSpan).toBeInTheDocument();
      expect(coloredSpan).toHaveClass("ansi-green-fg");
      expect(container.innerHTML).toBe(
        '<code><span>hello </span><span class="ansi-green-fg">world</span></code>',
      );
    });

    test("can add the background color class", () => {
      const { container } = render(
        React.createElement(
          Ansi,
          { useClasses: true },
          `hello ${YELLOW_BG}world`,
        ),
      );
      const codeElement = container.querySelector("code");
      const coloredSpan = container.querySelector(".ansi-yellow-bg");

      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveTextContent("hello world");
      expect(coloredSpan).toBeInTheDocument();
      expect(coloredSpan).toHaveClass("ansi-yellow-bg");
      expect(container.innerHTML).toBe(
        '<code><span>hello </span><span class="ansi-yellow-bg">world</span></code>',
      );
    });

    test("can add font and background color classes", () => {
      const { container } = render(
        React.createElement(
          Ansi,
          { useClasses: true },
          `hello ${GREEN_FG}${YELLOW_BG}world`,
        ),
      );
      const codeElement = container.querySelector("code");
      const coloredSpan = container.querySelector(
        ".ansi-yellow-bg.ansi-green-fg",
      );

      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveTextContent("hello world");
      expect(coloredSpan).toBeInTheDocument();
      expect(coloredSpan).toHaveClass("ansi-yellow-bg", "ansi-green-fg");
      expect(container.innerHTML).toBe(
        '<code><span>hello </span><span class="ansi-yellow-bg ansi-green-fg">world</span></code>',
      );
    });

    test("can add text decoration classes", () => {
      const { container } = render(
        React.createElement(
          Ansi,
          { useClasses: true },
          `hello ${GREEN_FG}${BOLD}world${RESET}!`,
        ),
      );
      const codeElement = container.querySelector("code");
      const styledSpan = container.querySelector(".ansi-green-fg.ansi-bold");

      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveTextContent("hello world!");
      expect(styledSpan).toBeInTheDocument();
      expect(styledSpan).toHaveClass("ansi-green-fg", "ansi-bold");
      expect(container.innerHTML).toBe(
        '<code><span>hello </span><span class="ansi-green-fg ansi-bold">world</span><span>!</span></code>',
      );
    });

    test("can use useClasses with linkify", () => {
      const { container } = render(
        React.createElement(
          Ansi,
          { linkify: true, useClasses: true },
          `${GREEN_FG}this is a link: https://nteract.io/`,
        ),
      );
      const codeElement = container.querySelector("code");
      const linkElement = container.querySelector("a");
      const coloredSpan = container.querySelector(".ansi-green-fg");

      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveTextContent(
        "this is a link: https://nteract.io/",
      );
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", "https://nteract.io/");
      expect(coloredSpan).toBeInTheDocument();
      expect(coloredSpan).toHaveClass("ansi-green-fg");
      expect(container.innerHTML).toBe(
        '<code><span class="ansi-green-fg">this is a link: <a href="https://nteract.io/" target="_blank">https://nteract.io/</a></span></code>',
      );
    });

    test("can add text decoration styles", () => {
      const { container } = render(
        React.createElement(Ansi, {}, `hello ${GREEN_FG}${BOLD}world${RESET}!`),
      );
      const codeElement = container.querySelector("code");
      const styledSpan = container.querySelector(
        'span[style*="color"][style*="font-weight"]',
      );

      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveTextContent("hello world!");
      expect(styledSpan).toBeInTheDocument();
      expect(styledSpan).toHaveStyle({
        color: "rgb(0, 187, 0)",
        fontWeight: "bold",
      });
      expect(container.innerHTML).toBe(
        '<code><span>hello </span><span style="color: rgb(0, 187, 0); font-weight: bold;">world</span><span>!</span></code>',
      );
    });
  });
});
