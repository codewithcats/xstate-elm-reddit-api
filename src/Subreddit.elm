module Subreddit exposing (..)

import Html exposing (..)
import Html.Attributes as Attr
import Json.Decode as D


type alias Post =
    { title : String
    , permalink : String
    }


postDecoder : D.Decoder Post
postDecoder =
    D.map2 Post (D.field "title" D.string) (D.field "permalink" D.string)


type State
    = NoSubredditSelected
    | Loading { subreddit : String }
    | Loaded { subreddit : String, posts : List Post }
    | Failed { subreddit : String }


{-|

    {
        "value": "loaded",
        "context": {
            "posts": [],
            "subreddit": "elm"
        }
    }

-}
stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\str ->
                case str of
                    "loading" ->
                        D.at [ "context", "subreddit" ] D.string |> D.andThen (\subreddit -> D.succeed (Loading { subreddit = subreddit }))

                    "loaded" ->
                        D.map2 (\subreddit posts -> { subreddit = subreddit, posts = posts })
                            (D.at [ "context", "subreddit" ] D.string)
                            (D.at [ "context", "posts" ] (D.list postDecoder))
                            |> D.andThen (Loaded >> D.succeed)

                    "failed" ->
                        D.at [ "context", "subreddit" ] D.string |> D.andThen (\subreddit -> D.succeed (Failed { subreddit = subreddit }))

                    s ->
                        D.fail ("Unknown subreddit machine state: " ++ s)
            )


view : State -> Html msg
view state =
    div []
        [ case state of
            NoSubredditSelected ->
                p [] [ text "No subreddit selected" ]

            Loading _ ->
                p [] [ text "Loading..." ]

            Loaded { posts } ->
                ul []
                    (List.map
                        (\post ->
                            li []
                                [ a
                                    [ Attr.target "_blank"
                                    , Attr.href post.permalink
                                    ]
                                    [ text post.title ]
                                ]
                        )
                        posts
                    )

            _ ->
                div [] []
        ]
