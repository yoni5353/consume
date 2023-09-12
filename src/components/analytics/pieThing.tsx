import { api } from "~/utils/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { countBy } from "lodash";

export function PieThing() {
  const { data: pieData } = api.items.getRecentItems.useQuery();

  // Would be in server
  const aggData = countBy(pieData, "mediaType.name");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Future pie chart</CardTitle>
        <CardDescription>Add dropdown controllers here</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.entries(aggData).map(([mediaTypeName, amount]) => (
          <p key={mediaTypeName}>
            {mediaTypeName}: {amount}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
