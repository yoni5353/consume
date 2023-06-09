import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "~/components/ui/command";
import { LinkIcon, PlusCircleIcon, LayoutTemplateIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { api } from "~/utils/api";
import { scrapers } from "~/utils/scrapers/main";
import { cn } from "~/utils/ui/cn";
import { CommandLoading } from "cmdk";
import { useToast } from "./ui/use-toast";
import { StoryDialog } from "./storyDialog";

export function ItemCreationInput({ listId }: { listId: string }) {
  const [term, setTerm] = useState<string>("");
  const [dialogStoryId, setDialogStoryId] = useState<string>();

  const { toast } = useToast();

  const ctx = api.useContext();

  const { data: templates, isLoading } = api.templates.searchItemTemplates.useQuery(
    term,
    { keepPreviousData: true }
  );

  const { data: stories } = api.templates.searchStories.useQuery(term, {
    keepPreviousData: true,
  });

  const { mutate: createItem } = api.items.createItem.useMutation({
    onSuccess: () => {
      setTerm("");
      void ctx.lists.getList.invalidate(listId);
    },
  });

  const { mutate: createItemFromTemplate } = api.items.createItemFromTemplate.useMutation(
    {
      onSuccess: () => {
        setTerm("");
        void ctx.lists.getList.invalidate(listId);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create item from template",
          variant: "destructive",
        });
      },
    }
  );

  const { mutate: createItemFromLink } = api.items.createItemFromLink.useMutation({
    onSuccess: () => {
      setTerm("");
      void ctx.lists.getList.invalidate(listId);
    },
  });

  const onCreateNew = useCallback(() => {
    createItem({ listId, item: { title: term } });
  }, [createItem, listId, term]);

  const onCreateFromTemplate = useCallback(
    (templateId: string) => {
      createItemFromTemplate({ listId, templateId });
    },
    [createItemFromTemplate, listId]
  );

  const onCreateNewFromLink = useCallback(() => {
    createItemFromLink({ listId, link: term });
  }, [createItemFromLink, listId, term]);

  const matchingScraperLists = scrapers.filter((scraper) => {
    return scraper.regex.test(term);
  });

  const showBaseLink =
    (term.startsWith("https://") || term.startsWith("http://")) &&
    matchingScraperLists.length === 0;

  return (
    <>
      <Command className="h-min w-full rounded-lg border shadow-md" shouldFilter={false}>
        <CommandInput
          placeholder="Enter item title or paste a link..."
          value={term}
          onValueChange={setTerm}
        />
        {!!term && (
          <CommandList>
            <CommandGroup className={cn(!!term && !!templates?.length ? "pb-0" : "")}>
              {matchingScraperLists.map((scraper) => (
                <CommandItem
                  key={scraper.name}
                  onSelect={() => createItemFromLink({ listId, link: term })}
                  title="Create an item based on the given link"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Create {scraper.name} Item
                </CommandItem>
              ))}
              {showBaseLink && (
                <CommandItem
                  onSelect={onCreateNewFromLink}
                  title="Create generic Item with the given link"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Create Generic Link Item
                </CommandItem>
              )}
              <CommandItem
                onSelect={onCreateNew}
                title="Creates new Item with the give title"
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create Item
              </CommandItem>
            </CommandGroup>
            {!!term && !!stories?.length && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Stories">
                  {/* {isLoading && <CommandLoading>Loading...</CommandLoading>} */}
                  {stories?.map((story) => {
                    return (
                      <CommandItem
                        key={story.id}
                        onSelect={() => setDialogStoryId(story.id)}
                      >
                        <LayoutTemplateIcon className="mr-2 h-4 w-4" />
                        {story.title}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
            {!!term && !!templates?.length && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Templates">
                  {isLoading && <CommandLoading>Loading...</CommandLoading>}
                  {templates?.map((template) => {
                    return (
                      <CommandItem
                        key={template.id}
                        onSelect={() => onCreateFromTemplate(template.id)}
                      >
                        <LayoutTemplateIcon className="mr-2 h-4 w-4" />
                        {template.title}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        )}
      </Command>
      {dialogStoryId && (
        <StoryDialog
          storyId={dialogStoryId}
          open={true}
          onOpenChange={() => setDialogStoryId(undefined)}
          onCreateItem={(templateId) => createItemFromTemplate({ listId, templateId })}
        />
      )}
    </>
  );
}
