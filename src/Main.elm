module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Decode as D
import Json.Encode as E
import MachineConnector
import SearchBox
import Subreddit


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
    , subreddit : Subreddit.State
    , searchBox : SearchBox.Model
    , subredditOptions : List String
    }


type State
    = Idle
    | SubredditSelected


{-|

    {
        "value": "subredditSelected",
        "context": {
            "subreddit": {},
            "subredditOptions": ["elm", "react"],
            "searchBox": {}
        }
    }

-}
modelDecoder : D.Decoder Model
modelDecoder =
    D.map4 Model
        stateDecoder
        subredditDecoder
        searchBoxDecoder
        subredditOptionsDecoder


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "idle" ->
                        D.succeed Idle

                    "subredditSelected" ->
                        D.succeed SubredditSelected

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


subredditOptionsDecoder : D.Decoder (List String)
subredditOptionsDecoder =
    D.at [ "context", "subredditOptions" ] (D.list D.string)


subredditDecoder : D.Decoder Subreddit.State
subredditDecoder =
    D.oneOf
        [ D.at [ "context", "subredditMachine", "state" ] Subreddit.stateDecoder
        , D.succeed Subreddit.initialState
        ]


searchBoxDecoder : D.Decoder SearchBox.Model
searchBoxDecoder =
    D.oneOf
        [ D.at [ "context", "searchBox", "state" ] SearchBox.modelDecoder
        , D.succeed SearchBox.initialModel
        ]


type Msg
    = StateChanged Model
    | DecodeStateError D.Error
    | SubredditClicked String
    | SearchBoxMsg SearchBox.Msg


init : () -> ( Model, Cmd Msg )
init _ =
    ( { state = Idle
      , subreddit = Subreddit.initialState
      , searchBox = SearchBox.initialModel
      , subredditOptions = []
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( m, Cmd.none )

        DecodeStateError _ ->
            ( model, Cmd.none )

        SubredditClicked subreddit ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "SELECT" )
                    , ( "subreddit", E.string subreddit )
                    ]
                )
            )

        SearchBoxMsg msg_ ->
            SearchBox.update msg_ model.searchBox
                |> Tuple.mapBoth
                    (\m -> { model | searchBox = m })
                    (Cmd.map SearchBoxMsg)


view : Model -> Html Msg
view model =
    div [ Attr.id "main__view" ]
        [ viewSubredditOptions model.subredditOptions
        , SearchBox.view model.searchBox |> map SearchBoxMsg
        , Subreddit.view model.subreddit
        ]


viewSubredditOptions : List String -> Html Msg
viewSubredditOptions options =
    ul []
        (List.map
            (\option ->
                li [] [ button [ onClick (SubredditClicked option) ] [ text option ] ]
            )
            options
        )


subscriptions : Model -> Sub Msg
subscriptions _ =
    MachineConnector.stateChanged
        (\value ->
            case D.decodeValue modelDecoder value of
                Ok m ->
                    StateChanged m

                Err e ->
                    DecodeStateError e
        )
