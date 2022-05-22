# Challenge Completion Badges

There is a badge icon for each challenge completed.

There are green badges for running challenges and purple badges for volunteer credits.
The volunteer badges will get stars if you have done them 5+, 10+, & 25+ times.

# Generating the stars overlay

The following `imagemagick` command will add the stars to a base set of images
```
find . -name "volunteer-*.png" | grep -v star | cut -c 3- | sed 's/.png$//' | xargs -I % convert %.png overlays/1-star.png -composite %-1-star.png
```
```
find . -name "volunteer-*.png" | grep -v star | cut -c 3- | sed 's/.png$//' | xargs -I % convert %.png overlays/2-stars.png -composite %-2-stars.png
```
```
find . -name "volunteer-*.png" | grep -v star | cut -c 3- | sed 's/.png$//' | xargs -I % convert %.png overlays/3-stars.png -composite %-3-stars.png
```

# Setting up a Wacom Intuos CTL-480

If you have a Wacom tablet, it makes drawing these badges a breeze - much better
than a mouse. To configure the tablet on a Mac, download the driver from
[the Wacom website](https://www.wacom.com/en/support/product-support/drivers).
