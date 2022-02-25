port module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Encode as E


port stateChanged : (Context -> msg) -> Sub msg


port machineEvent : E.Value -> Cmd msg


main : Program () Context Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Context =
    { subreddit : Maybe String
    , subredditOptions : List String
    , posts : Maybe (List Post)
    }


type alias Post =
    { title : String
    , permalink : String
    }


type Msg
    = StateChanged Context
    | SubredditClicked String


init : () -> ( Context, Cmd Msg )
init _ =
    ( { subreddit = Nothing
      , subredditOptions = []
      , posts = Nothing
      }
    , Cmd.none
    )


update : Msg -> Context -> ( Context, Cmd Msg )
update msg ctx =
    case msg of
        StateChanged context ->
            ( context, Cmd.none )

        SubredditClicked subreddit ->
            ( ctx
            , machineEvent
                (E.object
                    [ ( "type", E.string "SELECT" )
                    , ( "name", E.string subreddit )
                    ]
                )
            )


view : Context -> Html Msg
view context =
    div [ Attr.id "main__view" ]
        [ ul []
            (List.map
                (\option ->
                    li [] [ button [ onClick (SubredditClicked option) ] [ text option ] ]
                )
                context.subredditOptions
            )
        , case context.subreddit of
            Just subreddit ->
                h2 [] [ text subreddit ]

            Nothing ->
                p [] [ text "No subreddit selected" ]
        , case context.posts of
            Just posts ->
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

            Nothing ->
                div [] []
        ]


subscriptions : Context -> Sub Msg
subscriptions _ =
    stateChanged StateChanged
