import { api } from "~/utils/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import { MediaTypeIcon } from "../resources/mediaTypeIcon";

export function RecentItems() {
  const { data: recentItems } = api.items.getRecentItems.useQuery();

  return (
    <Card className="col-span-3 h-min">
      <CardHeader>
        <CardTitle>Recent Items</CardTitle>
        <CardDescription>Items recenetly created.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {recentItems?.map((item) => (
          <div key={item.id} className="flex items-center">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                className="rounded-md"
                width={48}
                height={64}
              />
            ) : (
              <div className="flex h-[64px] w-[48px] items-center justify-center">
                <MediaTypeIcon mediaType={item.mediaType ?? undefined} />
              </div>
            )}
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                Created {dayjs(item.createdAt).fromNow()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
