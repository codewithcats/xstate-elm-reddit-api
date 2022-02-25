module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes as Attr


main : Program () Context Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Context =
    {}


type Msg
    = StateChanged Context


init : () -> ( Context, Cmd Msg )
init _ =
    ( {}, Cmd.none )


update : Msg -> Context -> ( Context, Cmd Msg )
update msg _ =
    case msg of
        StateChanged context ->
            ( context, Cmd.none )


view : Context -> Html Msg
view context =
    div [ Attr.id "main__view" ] []


subscriptions : Context -> Sub Msg
subscriptions _ =
    Sub.none
