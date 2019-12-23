# Patches

Some files don't play nice in extensions compared to websites, in particular the
paths used in CSS files in Leaflet need modifying to reference the extension
base URL. Additionally, this path is different for Firefox compared to Chrome
(and potentially others), so we are going to use patch files to make all the
changes. They should be run against the root of the build

## Creating a patch file

`patch` files are created using the `diff` command with the `-u` switch.

To create an initial patch file, create a modified copy of the file as it should
end up and run a command similar to the following:

```
diff -u css/third-party/leaflet/leaflet.css css/third-party/leaflet/leaflet.css.patched > patches/chrome/css_third-party_leaflet_leaflet.css.patch
```

The patch file is applied using the path included at the header of the file, so
by doing it from the top level we can ensure it will be applied to the right
file in the build

## Applying a patch files

A patch file is processed by piping it into the patch command. the `-p0` argument
is needed if the path in the file is the correct one to modify

```
patch -p0 < some_changes.patch
```


## Applying all the patch files
To apply all the patch files in a directory run the following, substituting a
value in for `$BUILD_DIR_ROOT`, which contains the `css/`, `js/`, etc directories.

```
for i in patches/chrome/*.patch; do patch -p0 --directory $BUILD_DIR_ROOT < $i; done
```
