port module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Decode as D
import Json.Encode as E


port stateChanged : ({ state : E.Value, context : Context } -> msg) -> Sub msg


port machineEvent : E.Value -> Cmd msg


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { state : State
    , context : Context
    }


type State
    = Idle
    | Selected String


stateDecoder : D.Decoder State
stateDecoder =
    D.oneOf
        [ D.string
            |> D.andThen
                (\str ->
                    case str of
                        "idle" ->
                            D.succeed Idle

                        _ ->
                            D.fail ("Unknown string value:" ++ str)
                )
        ]


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
    = StateChanged State Context
    | DecodeStateError D.Error
    | SubredditClicked String


init : () -> ( Model, Cmd Msg )
init _ =
    ( { context =
            { subreddit = Nothing
            , subredditOptions = []
            , posts = Nothing
            }
      , state = Idle
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged state context ->
            ( { model | context = context, state = state }, Cmd.none )

        DecodeStateError _ ->
            ( model, Cmd.none )

        SubredditClicked subreddit ->
            ( model
            , machineEvent
                (E.object
                    [ ( "type", E.string "SELECT" )
                    , ( "name", E.string subreddit )
                    ]
                )
            )


view : Model -> Html Msg
view { context } =
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


subscriptions : Model -> Sub Msg
subscriptions _ =
    stateChanged
        (\{ state, context } ->
            case D.decodeValue stateDecoder state of
                Ok s ->
                    StateChanged s context

                Err e ->
                    DecodeStateError e
        )
