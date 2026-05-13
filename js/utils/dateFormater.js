export function dateFormater(){
    return new Date().toLocaleDateString("fr-FR", {
            day: "2-digit", month: "short", year: "numeric",
        })
}