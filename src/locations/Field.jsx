import React, { useEffect } from "react";
import { Box, Button, EntityList, MenuItem } from "@contentful/f36-components";
import {
  /* useCMA, */ useSDK,
  useFieldValue,
} from "@contentful/react-apps-toolkit";
import { JsonEditor } from "@contentful/field-editor-json";
import { getYearFromString } from "../utils/formatDate";

const Field = () => {
  const sdk = useSDK();
  const [value, setValue] = useFieldValue();

  const handleClick = async () => {
    const result = await sdk.dialogs.openCurrentApp({
      shouldCloseOnEscapePress: true,
      shouldCloseOnOverlayClick: true,
      minHeight: "600px",
      // title: 'Select a movie',
      // @ts-expect-error The App SDK types are not correct :(
      parameters: value,
    });
    if (!result) {
      return;
    }
    // Populate JSON field, and also set CF entry title.
    sdk.entry.fields.title.setValue(result.movie.title);
    setValue(result);
  };

  useEffect(() => {
    sdk.window.startAutoResizer();
    console.log(sdk.window);
  }, [sdk.window]);

  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/

  return (
    <>
      <Box marginBottom="spacingM">
        <Button variant="primary" onClick={handleClick}>
          Select a movie
        </Button>
      </Box>
      {value?.movie && (
        <EntityList>
          <EntityList.Item
            title={`${value.movie.title} (${getYearFromString(
              value.movie.release_date
            )})`}
            description={value.movie.overview}
            thumbnailUrl={`https://image.tmdb.org/t/p/w92/${value.movie.image}`}
            actions={[
              <MenuItem
                key="remove"
                onClick={() => {
                  sdk.field.removeValue();
                }}
              >
                Remove
              </MenuItem>,
            ]}
          />
        </EntityList>
      )}
      {/* <JsonEditor field={sdk.field} /> */}
    </>
  );
};

export default Field;
