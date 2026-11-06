import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { HOME_PHOTOS, type HomePhotoName } from "./photos";

interface HomePhotoProps {
  name: HomePhotoName;
  /** Frame shape, as Tailwind aspect classes. The photo is cropped to it. */
  frameClassName?: string;
  /** The hero photo loads first; everything else waits until it is near. */
  priority?: boolean;
  className?: string;
}

/**
 * One photo place on the homepage. The frame has a fixed shape, so a new photo
 * from `photos.ts` drops in without moving anything around it.
 */
export const HomePhoto = ({
  name,
  frameClassName = "aspect-[4/5]",
  priority = false,
  className,
}: HomePhotoProps) => {
  const { t } = useTranslation();
  const photo = HOME_PHOTOS[name];
  const contain = photo.fit === "contain";

  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-lg",
        // A drawing sits on white, as it was drawn; a photo gets a Mist
        // ground so the frame holds its shape while the image loads.
        contain ? "bg-white" : "bg-secondary",
        frameClassName,
        className,
      )}
      data-photo-slot={name}
    >
      <img
        src={photo.src}
        alt={t(photo.altKey)}
        width={photo.width}
        height={photo.height}
        className={cn(
          "absolute inset-0 h-full w-full",
          contain ? "object-contain p-2 sm:p-4" : "object-cover",
        )}
        loading={priority ? "eager" : "lazy"}
        // React 18 only passes the attribute through in lowercase.
        {...(priority ? { fetchpriority: "high" } : {})}
        decoding="async"
      />
    </figure>
  );
};
