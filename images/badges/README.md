# Challenge Completion Badges

There is a badge icon for each challenge completed.

There are green badges for running challenges and purple badges for volunteer credits.
The volunteer badges will get stars if you have done them 5+, 10+, & 25+ times.

# Generating the stars overlay

The following `imagemagick` command will add the stars to a base set of images
```
find . -name "volunteer-*.png" | grep -v star | cut -c 3- | sed 's/.png$//' | xargs -I % convert %.png overlays/1-star.png -composite stars/%-1-star.png
```
```
find . -name "volunteer-*.png" | grep -v star | cut -c 3- | sed 's/.png$//' | xargs -I % convert %.png overlays/2-stars.png -composite stars/%-2-stars.png
```
```
find . -name "volunteer-*.png" | grep -v star | cut -c 3- | sed 's/.png$//' | xargs -I % convert %.png overlays/3-stars.png -composite stars/%-3-stars.png
```
