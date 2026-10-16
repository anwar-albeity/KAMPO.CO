Drop the licensed Miranda display fonts here, renamed exactly as below.
Then add this line to index.html, just above the site.min.css line:
  <link rel="stylesheet" href="css/fonts.css" />
Until then the site uses Fraunces (free) at a heavy weight and makes no font requests for these files.

  display.woff2          Domaine Display (Black or Bold)   or   Canopée   -> every big headline
  display-italic.woff2   matching italic (optional)                       -> small italic accents
  editorial.woff2        PP Editorial New (Regular)                       -> optional, sub-text

If your files are .otf or .ttf, convert them to .woff2 first (for example with
https://cloudconvert.com/otf-to-woff2), and only if your licence allows web use.
