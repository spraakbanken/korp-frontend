/** @format */
module.exports = {
    // pug doesn't support special characters in class names, so no colon.
    separator: "_",
    content: ["./app/**/*.js", "./app/**/*.html", "./app/**/*.pug"],
    theme: {
        extend: {
            colors: {
                gray: {
                    100: "#f5f5f5",
                    200: "#eeeeee",
                    300: "#e0e0e0",
                    400: "#bdbdbd",
                    500: "#9e9e9e",
                    600: "#757575",
                    700: "#616161",
                    800: "#424242",
                    900: "#212121",
                },
                orange: {
                    900: "#f2581a",
                },
                blue: {
                    100: "rgb(221, 233, 255)",
                },
            },
        },
    },
    safelist: ["my-5", "h-16"],
}
