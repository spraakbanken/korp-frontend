/** @format */
module.exports = {
    content: ["./app/**/*.js", "./app/**/*.ts", "./app/**/*.html"],
    theme: {
        extend: {
            animation: {
                "spin-slow": "spin 2s linear infinite",
            },
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
    // classes used in, for example, mode-files are not added to bundle automatically
    safelist: ["my-5", "h-32", "p-5", "text-lg", "mt-2", "mt-3"],
}
