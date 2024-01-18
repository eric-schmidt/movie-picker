import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  EntityList,
  Form,
  FormControl,
  Spinner,
  TextInput,
  TextLink,
} from "@contentful/f36-components";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import { getYearFromString } from "../utils/formatDate";

const Dialog = () => {
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();

  const sdk = useSDK();
  const tmdbApiKey = sdk.parameters.installation.rawgApiKey;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUrl, setSearchUrl] = useState(
    `https://api.themoviedb.org/3/search/multi`
  );
  const [movieData, setMovieData] = useState();

  const fetchMovies = async (url) => {
    try {
      setLoading(true);
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${tmdbApiKey}`,
        },
      };
      const response = await fetch(url, options);
      const json = await response.json();
      // Update movie data and loading state.
      setMovieData(json);
      setLoading(false);
    } catch (err) {
      setError(true);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMovies(searchUrl);
  }, [searchUrl]);

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk.window]);

  // Break results out into separate component for easier conditional rendering.
  const Results = () => {
    if (error) {
      return (
        <Box marginTop="spacingL" marginBottom="spacingL">
          Error! Please ensure you've added your{" "}
          <TextLink
            href="https://developer.themoviedb.org/docs/getting-started"
            target="_blank"
          >
            TMDb API key
          </TextLink>{" "}
          on the Movie Picker app configuration screen. Check your browser's
          console for more error details.
        </Box>
      );
    } else if (movieData && movieData.count === 0) {
      return (
        <Box marginTop="spacingL" marginBottom="spacingL">
          No Results Found. Please try a different search term.
        </Box>
      );
    } else if (!movieData || loading) {
      return (
        <Box marginTop="spacingL" marginBottom="spacingL">
          <Spinner customSize={50} />
        </Box>
      );
    } else {
      return (
        <Box marginTop="spacingXl" marginBottom="spacingM">
          <EntityList>
            {movieData.results.map((movie) => (
              <EntityList.Item
                key={movie.id}
                title={`${movie.title} (${getYearFromString(
                  movie.release_date
                )})`}
                description={movie.overview}
                thumbnailUrl={`https://image.tmdb.org/t/p/w92/${movie.poster_path}`}
                onClick={() =>
                  sdk.close({
                    movie: {
                      id: movie.id,
                      title: movie.title,
                      overview: movie.overview,
                      release_date: movie.release_date,
                      image: movie.poster_path,
                    },
                  })
                }
              />
            ))}
          </EntityList>
        </Box>
      );
    }
  };

  return (
    <>
      <Box
        paddingTop="spacingL"
        paddingRight="spacing2Xl"
        paddingBottom="spacingL"
        paddingLeft="spacing2Xl"
      >
        <Form
          onSubmit={() => {
            fetchMovies(
              `https://api.themoviedb.org/3/search/movie?query=${searchTerm}`
            );
          }}
        >
          <FormControl marginBottom="spacingXs">
            <FormControl.Label>Search</FormControl.Label>
            <TextInput
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
            <FormControl.HelpText>
              Please enter some search terms.
            </FormControl.HelpText>
          </FormControl>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </Form>

        {/* Render the results. */}
        {<Results />}

        <Box>
          {/* TODO: UPDATE THIS TO USE TMDb prev/next page logic */}
          {/* Use the provided prev/next URLs that RAWG supplies, reactively updating searchUrl re-triggers the fetch. */}
          {movieData && movieData.previous && (
            <Button onClick={() => setSearchUrl(movieData.previous)}>
              Previous
            </Button>
          )}
          {movieData && movieData.next && (
            <Button onClick={() => setSearchUrl(movieData.next)}>Next</Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Dialog;
